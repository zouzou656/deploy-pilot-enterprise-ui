import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui-custom/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Info, Code, ChevronDown, ChevronRight, Folder, Maximize2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Diff, Hunk, parseDiff } from 'react-diff-view'
import 'react-diff-view/style/index.css'

// API base
const API = 'http://localhost:5020/api/git'

// FileEntry and TreeNode types
type FileEntry = { filename: string; status?: string; patch?: string }
type TreeNode = {
    name: string
    path: string
    children: TreeNode[]
    isFile: boolean
    status?: string
    patch?: string
}

// Build nested tree from file list
function buildTree(files: FileEntry[]): TreeNode[] {
    const roots: TreeNode[] = []
    const map = new Map<string, TreeNode>()
    files.forEach(({ filename, status, patch }) => {
        const parts = filename.split('/')
        let nodes = roots
        let prefix = ''
        parts.forEach((part, idx) => {
            prefix = prefix ? `${prefix}/${part}` : part
            let node = map.get(prefix)
            const isFile = idx === parts.length - 1
            if (!node) {
                node = {
                    name: part,
                    path: prefix,
                    children: [],
                    isFile,
                    status: isFile ? status : undefined,
                    patch: isFile ? patch : undefined,
                }
                map.set(prefix, node)
                nodes.push(node)
            }
            nodes = node.children
        })
    })
    return roots
}

// Collect folder‐paths for “expand all”
function collectFolders(nodes: TreeNode[]): string[] {
    let out: string[] = []
    nodes.forEach((n) => {
        if (!n.isFile) {
            out.push(n.path)
            out = out.concat(collectFolders(n.children))
        }
    })
    return out
}

// Tree view for folders/files
function TreeView({
                      nodes,
                      expanded,
                      onToggle,
                      selected,
                      toggleFile,
                      onHighlight,
                  }: {
    nodes: TreeNode[]
    expanded: Set<string>
    onToggle: (path: string) => void
    selected: string[]
    toggleFile: (path: string) => void
    onHighlight: (fe: FileEntry) => void
}) {
    return (
        <ul className="pl-4 space-y-1">
            {nodes.map((n) => (
                <li key={n.path}>
                    {n.isFile ? (
                        <div className="flex justify-between items-center p-1 hover:bg-muted/10 rounded">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selected.includes(n.path)}
                                    onCheckedChange={() => toggleFile(n.path)}
                                />
                                <button
                                    className="text-left hover:underline text-sm"
                                    onClick={() =>
                                        onHighlight({
                                            filename: n.path,
                                            status: n.status!,
                                            patch: n.patch,
                                        })
                                    }
                                >
                                    {n.name}
                                </button>
                            </div>
                            <span className="text-xs uppercase text-muted-foreground">
                                {n.status}
                            </span>
                        </div>
                    ) : (
                        <div className="mb-1">
                            <div
                                className="flex items-center gap-1 cursor-pointer"
                                onClick={() => onToggle(n.path)}
                            >
                                {expanded.has(n.path) ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                                <Folder className="h-4 w-4" />
                                <span className="font-medium">{n.name}</span>
                            </div>
                            {expanded.has(n.path) && (
                                <TreeView
                                    nodes={n.children}
                                    expanded={expanded}
                                    onToggle={onToggle}
                                    selected={selected}
                                    toggleFile={toggleFile}
                                    onHighlight={onHighlight}
                                />
                            )}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )
}

// DiffViewer with headers and error handling
function DiffViewer({ filename, patch }: { filename: string, patch?: string }) {
    if (!patch) return <p className="text-sm text-muted">No changes</p>

    const header = [
        `diff --git a/${filename} b/${filename}`,
        `--- a/${filename}`,
        `+++ b/${filename}`,
    ].join('\n')

    // Prepend header if not already present
    const unified = patch.startsWith('diff --git')
        ? patch
        : header + '\n' + patch

    let files
    try {
        files = parseDiff(unified)
    } catch (err) {
        console.error('parseDiff error', err)
        return (
            <pre className="p-2 bg-muted rounded overflow-auto text-sm whitespace-pre-wrap ">
                {unified}
            </pre>
        )
    }

    if (!files.length)
        return <p className="text-sm text-muted">Empty diff</p>

    const file = files.find(f => f.hunks.length) || files[0]

    return (
        <Diff
            viewType="split"
            diffType="modify"
            hunks={file.hunks}
            filePath={file.newPath}
        >
            {(hunks) => hunks.map((h, idx) => <Hunk key={idx} hunk={h} />)}
        </Diff>
    )
}

export default function GitManagement() {
    const [branch, setBranch] = useState('main')
    const [selectedCommitSha, setSelectedCommitSha] = useState<string>()
    const [filesExpanded, setFilesExpanded] = useState<Set<string>>(new Set())
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [highlighted, setHighlighted] = useState<FileEntry | null>(null)

    // Load branches
    const {
        data: branches = [],
        isLoading: loadingBranches,
    } = useQuery<string[]>({
        queryKey: ['branches'],
        queryFn: () => fetch(API + '/branches').then(r => r.json()),
    })

    // Load commits for branch
    const {
        data: commits = [],
        isLoading: loadingCommits,
    } = useQuery<any[]>({
        queryKey: ['commits', branch],
        enabled: !!branch,
        queryFn: () =>
            fetch(`${API}/commits?branch=${branch}`).then(r => r.json()),
    })

    // Load files for commit
    const {
        data: commitDetail,
        isLoading: loadingDetail,
    } = useQuery<any>({
        queryKey: ['commitDetail', selectedCommitSha],
        enabled: !!selectedCommitSha,
        queryFn: () =>
            fetch(`${API}/commit/${selectedCommitSha}`).then(r => r.json()),
    })

    // Build tree from files
    const treeData = useMemo(() => {
        if (!commitDetail?.files?.length) return []
        return buildTree(commitDetail.files)
    }, [commitDetail])

    // Expand all folders on files load
    useEffect(() => {
        setFilesExpanded(new Set(collectFolders(treeData)))
    }, [treeData])

    // Reset selected files when commit or branch changes
    useEffect(() => {
        setSelectedFiles([])
        setHighlighted(null)
    }, [selectedCommitSha, branch])

    // File selection logic
    const toggleExp = useCallback(
        (path: string) => {
            setFilesExpanded((s) => {
                const ns = new Set(s)
                ns.has(path) ? ns.delete(path) : ns.add(path)
                return ns
            })
        }, []
    )
    const expandAll = useCallback(() => {
        setFilesExpanded(new Set(collectFolders(treeData)))
    }, [treeData])
    const collapseAll = useCallback(() => {
        setFilesExpanded(new Set())
    }, [])
    const toggleFile = useCallback((path: string) => {
        setSelectedFiles((s) =>
            s.includes(path) ? s.filter((x) => x !== path) : [...s, path]
        )
    }, [])
    const selectAllFiles = useCallback(() => {
        if (!commitDetail?.files?.length) return
        setSelectedFiles(commitDetail.files.map((f: FileEntry) => f.filename))
    }, [commitDetail])
    const clearFiles = useCallback(() => setSelectedFiles([]), [])

    return (
        <div className="space-y-6">
            <PageHeader
                title="Git Management"
                description="Browse local Git repo branches, commits, files & diffs."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Repository &amp; Branch</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {/* Branch */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Branch</label>
                        {loadingBranches ? (
                            <p>Loading branches…</p>
                        ) : (
                            <select
                                className="p-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                value={branch}
                                onChange={e => {
                                    setBranch(e.target.value)
                                    setSelectedCommitSha(undefined)
                                }}
                            >
                                {branches.map(b => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    {/* Commit */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Commit</label>
                        {loadingCommits ? (
                            <p>Loading commits…</p>
                        ) : (
                            <select
                                className="p-2 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 w-64"
                                value={selectedCommitSha}
                                onChange={e => {
                                    setSelectedCommitSha(e.target.value)
                                }}
                            >
                                <option value="">— pick commit —</option>
                                {commits.map(c => (
                                    <option key={c.sha} value={c.sha}>
                                        {c.sha.slice(0, 7)} — {(c.message || c.commit?.message || '').split('\n')[0]}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="files">
                <TabsList>
                    <TabsTrigger value="files">
                        <Code className="mr-2" /> Files &amp; Diff
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Files changed in{' '}
                                {selectedCommitSha?.slice(0, 7) || '…'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingDetail ? (
                                <p>Loading files…</p>
                            ) : commitDetail?.files?.length ? (
                                <div className="flex gap-4">
                                    {/* File tree */}
                                    <div className="w-1/3">
                                        <div className="flex justify-end mb-2 gap-2">
                                            <Button size="sm" variant="outline" onClick={expandAll}>
                                                Expand All
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={collapseAll}>
                                                Collapse All
                                            </Button>
                                        </div>
                                        <ScrollArea className="h-80 p-2 border rounded">
                                            <TreeView
                                                nodes={treeData}
                                                expanded={filesExpanded}
                                                onToggle={toggleExp}
                                                selected={selectedFiles}
                                                toggleFile={toggleFile}
                                                onHighlight={f => setHighlighted(f)}
                                            />
                                        </ScrollArea>
                                        <div className="mt-2 flex justify-end space-x-4">
                                            <Button size="sm" variant="outline" onClick={selectAllFiles}>
                                                Select All
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={clearFiles}>
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Diff viewer */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold">Diff</h3>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="icon" variant="outline" aria-label="Expand diff">
                                                        <Maximize2 className="h-5 w-5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent
                                                    className="
                                                        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                                                        bg-white dark:bg-gray-900 rounded-2xl shadow-lg
                                                        w-[90vw] max-w-[1200px]
                                                        max-h-[90vh]
                                                        overflow-auto
                                                        flex flex-col
                                                    "
                                                >
                                                    <div className="flex items-center justify-between px-6 py-4 border-b">
                                                        <DialogTitle className="text-xl font-semibold">
                                                            File Diff Preview
                                                        </DialogTitle>
                                                        <DialogClose aria-label="Close"
                                                                     className="text-gray-500 hover:text-gray-700" />
                                                    </div>
                                                    <div className="flex-1 h-72 overflow-auto border rounded p-4
                                                        bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100
                                                        [&_.dv-content-add]:text-gray-900 dark:[&_.dv-content-add]:text-gray-100
                                                        [&_.dv-content-del]:text-gray-900 dark:[&_.dv-content-del]:text-gray-100
                                                    ">
                                                        {highlighted ? (
                                                            <DiffViewer {...highlighted} />
                                                        ) : (
                                                            <p className="text-gray-500 dark:text-gray-400">
                                                                Select a file to view its diff
                                                            </p>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="flex-1 h-72 overflow-auto border rounded p-4 bg-white text-gray-900
                                            dark:bg-gray-800 dark:text-gray-100
                                            border-gray-300 dark:border-gray-700
                                            focus:ring-2 focus:ring-blue-500
                                        ">
                                            {highlighted
                                                ? <DiffViewer {...highlighted} />
                                                : <p className="text-gray-500 dark:text-gray-400">
                                                    Select a file to view its diff
                                                </p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>No files changed or no commit selected.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
