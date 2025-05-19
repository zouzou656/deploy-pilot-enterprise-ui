import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react'
import {useQuery} from '@tanstack/react-query'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {Label} from '@/components/ui/label'
import {Checkbox} from '@/components/ui/checkbox'
import {ScrollArea} from '@/components/ui/scroll-area'
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs'
import PageHeader from '@/components/ui-custom/PageHeader'
import {Diff, Hunk, parseDiff} from 'react-diff-view'
import 'react-diff-view/style/index.css'
import {useToast} from '@/hooks/use-toast'
import {useNavigate} from 'react-router-dom'
import {
    GitBranch,
    Info,
    Code,
    Eye,
    ChevronDown,
    ChevronRight,
    Folder,
    Maximize2
} from 'lucide-react'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogClose,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {Tooltip, TooltipTrigger, TooltipContent} from '@/components/ui/tooltip'

const API = 'http://localhost:5020/api/git'

type Strategy = 'commit' | 'full' | 'manual'
type FileEntry = { filename: string; status: string; patch?: string }

type TreeNode = {
    name: string
    path: string
    children: TreeNode[]
    isFile: boolean
    status?: string
    patch?: string
}

// Build a nested tree from flat list of FileEntry
function buildTree(files: FileEntry[]): TreeNode[] {
    const roots: TreeNode[] = []
    const map = new Map<string, TreeNode>()
    files.forEach(({filename, status, patch}) => {
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

// Reusable tree view, with onToggle (folders), toggleFile (checkbox), onHighlight (click file)
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
                                    <ChevronDown className="h-4 w-4"/>
                                ) : (
                                    <ChevronRight className="h-4 w-4"/>
                                )}
                                <Folder className="h-4 w-4"/>
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

// Enhanced DiffViewer with header-dedup and error handling
function DiffViewer({filename, patch}: FileEntry) {
    if (!patch) return <p className="text-sm text-muted">No changes</p>

    const header = [
        `diff --git a/${filename} b/${filename}`,
        `--- a/${filename}`,
        `+++ b/${filename}`,
    ].join('\n')

    const unified = patch.startsWith('diff --git')
        ? patch
        : header + '\n' + patch

    let files
    try {
        files = parseDiff(unified)
    } catch (err) {
        console.error('parseDiff error', err)
        return (
            <pre className="p-2 bg-muted  rounded overflow-auto text-sm whitespace-pre-wrap ">
                {unified}
            </pre>
        )
    }

    if (!files.length) return <p className="text-sm text-muted">Empty diff</p>

    const file = files.find((f) => f.hunks.length) || files[0]

    return (
        <Diff
            viewType="split"
            diffType="modify"
            hunks={file.hunks}
            filePath={file.newPath}
        >
            {(hunks) => hunks.map((h, idx) => <Hunk key={idx} hunk={h}/>)}
        </Diff>
    )
}

export default function JarGeneration() {
    const {toast} = useToast()
    const navigate = useNavigate()

    const [branch, setBranch] = useState('main')
    const [version, setVersion] = useState('1.0.0')
    const [strategy, setStrategy] = useState<Strategy>('manual')
    const [selectedCommit, setSelectedCommit] = useState('')

    const [initialBase, setInitialBase] = useState('')
    const [initialHead, setInitialHead] = useState('')
    const [previewBase, setPreviewBase] = useState('')

    const [filesExpanded, setFilesExpanded] = useState<Set<string>>(new Set())
    const [previewExpanded, setPreviewExpanded] = useState<Set<string>>(new Set())
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [highlighted, setHighlighted] = useState<FileEntry | null>(null)

    useEffect(() => {
        console.log('Highlighted changed →', highlighted)
    }, [highlighted])

    // --- load branches & commits
    const {
        data: branches = [],
        isLoading: loadingBranches,
    } = useQuery({
        queryKey: ['branches'],
        queryFn: () =>
            fetch(API + '/branches').then((r) => r.json() as Promise<string[]>),
    })

    const {
        data: commits = [],
        isLoading: loadingCommits,
    } = useQuery({
        queryKey: ['commits', branch],
        enabled: !!branch,
        queryFn: () =>
            fetch(`${API}/commits?branch=${branch}`).then(
                (r) =>
                    r.json() as Promise<{ sha: string; message: string }[]>
            ),
    })

    // --- fetch all files at HEAD (manual mode)
    const {
        data: allFiles = [],
        isLoading: loadingAllFiles,
    } = useQuery({
        queryKey: ['allFiles', branch],
        enabled: strategy === 'manual' && !!branch,
        queryFn: () =>
            fetch(`${API}/tree?branch=${branch}`).then(r =>
                r.json() as Promise<string[]>
            ),
    })

    // Only build file list for manual mode
    const manualFiles = useMemo(() => {
        if (strategy !== 'manual') return []
        return allFiles.map(filename => ({
            filename,
            status: 'unmodified',
            patch: undefined,
        }))
    }, [allFiles, strategy])

    // compute initialBase/Head
    useEffect(() => {
        if (!commits.length) return
        const first = commits[commits.length - 1].sha
        const last = commits[0].sha
        if (strategy === 'commit' && selectedCommit) {
            const idx = commits.findIndex((c) => c.sha === selectedCommit)
            const parent =
                idx >= 0 && idx < commits.length - 1
                    ? commits[idx + 1].sha
                    : first
            setInitialBase(parent)
            setInitialHead(selectedCommit)
        } else {
            setInitialBase(first)
            setInitialHead(last)
        }
    }, [commits, strategy, selectedCommit])

    useEffect(() => {
        setPreviewBase(initialBase)
    }, [initialBase])

    // initial compare
    const {data: initialCmp} = useQuery({
        queryKey: ['compareInit', initialBase, initialHead],
        enabled: strategy !== 'manual' && !!initialBase && !!initialHead,
        queryFn: () =>
            fetch(
                `${API}/compare?baseSha=${initialBase}&headSha=${initialHead}`
            ).then((r) =>
                r.json() as Promise<{ files: FileEntry[] }>
            ),
    })
    const initialFiles = initialCmp?.files || []

    // preview compare-files
    const {data: previewCmp} = useQuery({
        queryKey: ['compareFiles', previewBase, initialHead, selectedFiles],
        enabled: strategy !== 'manual' && !!previewBase && !!initialHead && selectedFiles.length > 0,
        queryFn: () =>
            fetch(`${API}/compare-files`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    baseSha: previewBase,
                    headSha: initialHead,
                    files: selectedFiles,
                }),
            }).then((r) => {
                if (!r.ok) throw new Error('Preview diff failed')
                return r.json() as Promise<{ files: FileEntry[] }>
            }),
    })
    const previewFiles = previewCmp?.files || []

    // Choose which files to display (manual or diff mode)
    const filesToShow = strategy === 'manual' ? manualFiles : initialFiles
    const treeData = useMemo(
        () => buildTree(filesToShow),
        [filesToShow]
    )
    const previewTree = useMemo(
        () => buildTree(strategy === 'manual' ? [] : previewFiles),
        [previewFiles, strategy]
    )

    useEffect(
        () => setFilesExpanded(new Set(collectFolders(treeData))),
        [treeData]
    )
    useEffect(
        () =>
            setPreviewExpanded(new Set(collectFolders(previewTree))),
        [previewTree]
    )

    const toggleExp = useCallback(
        (isPreview: boolean, path: string) => {
            const fn = isPreview
                ? setPreviewExpanded
                : setFilesExpanded
            fn((s) => {
                const ns = new Set(s)
                ns.has(path) ? ns.delete(path) : ns.add(path)
                return ns
            })
        },
        []
    )
    const expandAll = useCallback(
        (isPreview: boolean) => {
            const fn = isPreview
                ? setPreviewExpanded
                : setFilesExpanded
            fn(new Set(collectFolders(isPreview ? previewTree : treeData)))
        },
        [treeData, previewTree]
    )
    const collapseAll = useCallback(
        (isPreview: boolean) => {
            const fn = isPreview
                ? setPreviewExpanded
                : setFilesExpanded
            fn(new Set())
        },
        []
    )
    const toggleFile = useCallback((path: string) => {
        setSelectedFiles((s) =>
            s.includes(path) ? s.filter((x) => x !== path) : [...s, path]
        )
    }, [])
    // --- JAR generation
    const handleGenerate = async () => {
        if (!selectedFiles.length) {
            return toast({
                title: 'No files selected',
                description: 'Please pick at least one file.',
                variant: 'destructive',
            })
        }
        const payload = {
            branch,
            version,
            strategy,
            baseSha: initialBase,
            headSha: initialHead,
            files: selectedFiles.map((fn) => {
                const f = filesToShow.find((x) => x.filename === fn)!
                return {filename: fn, status: f.status}
            }),
        }
        try {
            const r = await fetch('/api/jar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            })
            if (!r.ok) throw new Error()
            const {jarPath} = await r.json()
            toast({title: 'JAR generated', description: jarPath})
            navigate(`/jar-viewer/${encodeURIComponent(jarPath)}`)
        } catch {
            toast({
                title: 'Generation failed',
                description: 'Please try again.',
                variant: 'destructive',
            })
        }
    }

    // Disable preview in manual mode
    const previewTabDisabled = strategy === 'manual'

    return (
        <div className="space-y-6">
            <PageHeader
                title="JAR Generation"
                description="Select mode → pick commits → choose files → preview diffs → generate"
            />

            {/* Stats bar */}
            <div className="flex flex-wrap gap-6 px-4 py-2 bg-muted/10 rounded text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Info className="h-4 w-4"/> Total:{' '}
                    <strong>{filesToShow.length}</strong>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Info className="h-4 w-4"/> Selected:{' '}
                    <strong>{selectedFiles.length}</strong>
                </div>
                {strategy === 'commit' && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Info className="h-4 w-4"/> Commits:{' '}
                        <strong>{commits.length}</strong>
                    </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Info className="h-4 w-4"/> Mode:{' '}
                    <strong>
                        {strategy === 'commit'
                            ? 'Single-Commit'
                            : strategy === 'full'
                                ? 'Full-Build'
                                : 'Manual'}
                    </strong>
                </div>
            </div>

            {/* TABS */}
            <Tabs defaultValue="config" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="config">
                        <GitBranch className="mr-2"/> Config
                    </TabsTrigger>
                    <TabsTrigger value="files">
                        <Code className="mr-2"/> Select
                    </TabsTrigger>
                    <TabsTrigger value="preview" disabled={previewTabDisabled}>
                        <Eye className="mr-2"/> Preview
                    </TabsTrigger>
                </TabsList>

                {/* CONFIG */}
                <TabsContent value="config">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <GitBranch className="inline-block mr-2"/>
                                Repo &amp; Mode
                            </CardTitle>
                            <CardDescription>
                                Branch, version, strategy &amp; (if commit) SHA
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label>Branch <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Eye className="inline-block mr-2 cursor-pointer"/>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Git branch to package</TooltipContent>
                                </Tooltip>
                                </Label>
                                <select
                                    className="w-full p-2 border rounded bg-white text-gray-900
dark:bg-gray-800 dark:text-gray-100
border-gray-300 dark:border-gray-700
focus:ring-2 focus:ring-blue-500"
                                    value={branch}
                                    onChange={(e) => {
                                        setBranch(e.target.value)
                                        setSelectedFiles([])
                                        setHighlighted(null)
                                    }}
                                >
                                    {loadingBranches ? (
                                        <option>Loading branches…</option>
                                    ) : (
                                        branches.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Version */}
                            <div>
                                <Label>Version<Tooltip>
                                    <TooltipTrigger asChild>
                                        <Eye className="inline-block mr-2 cursor-pointer"/>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Semantic Version</TooltipContent>
                                </Tooltip></Label>
                                <input
                                    className="w-full p-2 border rounded bg-white text-gray-900
dark:bg-gray-800 dark:text-gray-100
border-gray-300 dark:border-gray-700
focus:ring-2 focus:ring-blue-500"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                />
                            </div>

                            {/* Strategy */}
                            <div>
                                <Label>Mode<Tooltip>
                                    <TooltipTrigger asChild>
                                        <Eye className="inline-block mr-2 cursor-pointer"/>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">How to pick your files</TooltipContent>
                                </Tooltip></Label>
                                <RadioGroup
                                    className="flex flex-col space-y-2 mt-2"
                                    value={strategy}
                                    onValueChange={(val) => {
                                        setStrategy(val as Strategy)
                                        setSelectedFiles([])
                                        setHighlighted(null)
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="commit" id="cmt"/>
                                        <Label htmlFor="cmt">Single-Commit</Label>
                                    </div>
                                    {strategy === 'commit' && (
                                        <select
                                            className="mt-1 p-2 border rounded w-full bg-white text-gray-900
dark:bg-gray-800 dark:text-gray-100
border-gray-300 dark:border-gray-700
focus:ring-2 focus:ring-blue-500"
                                            value={selectedCommit}
                                            onChange={(e) => setSelectedCommit(e.target.value)}
                                        >
                                            <option disabled value="">
                                                — pick commit —
                                            </option>
                                            {loadingCommits ? (
                                                <option>Loading…</option>
                                            ) : (
                                                commits.map((c) => (
                                                    <option key={c.sha} value={c.sha}>
                                                        {c.sha.slice(0, 7)} — {c.message}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="full" id="full"/>
                                        <Label htmlFor="full">Full-Build</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="manual" id="man"/>
                                        <Label htmlFor="man">Manual</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SELECT FILES */}
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Code className="inline-block mr-2"/>
                                Select Files
                            </CardTitle>
                            <CardDescription>
                                Check the files you wish to deploy
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end mb-2 gap-2">
                                <Button size="sm" variant="outline" onClick={() => expandAll(false)}>
                                    Expand All
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => collapseAll(false)}>
                                    Collapse All
                                </Button>
                            </div>
                            <ScrollArea className="h-80 p-2 border rounded">
                                <TreeView
                                    nodes={treeData}
                                    expanded={filesExpanded}
                                    onToggle={(p) => toggleExp(false, p)}
                                    selected={selectedFiles}
                                    toggleFile={toggleFile}
                                    onHighlight={(f) => setHighlighted(f)}
                                />
                            </ScrollArea>
                            <div className="mt-2 flex justify-end space-x-4">
                                <Button size="sm" variant="outline"
                                        onClick={() => setSelectedFiles(filesToShow.map((f) => f.filename))}>
                                    Select All
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setSelectedFiles([])}>
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PREVIEW */}
                <TabsContent value="preview">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Eye className="inline-block mr-2 cursor-pointer"/>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Preview &amp; Generate</TooltipContent>
                                </Tooltip>
                                Preview &amp; Generate
                            </CardTitle>
                            <CardDescription>
                                Override the “From” SHA to re-diff just your selected files
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {previewTabDisabled ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    <p>Preview not available in manual mode. All files are taken from the latest commit.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Commits selector */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <Label>
                                            To:
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Eye className="inline-block mr-2 cursor-pointer"/>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Fixed HEAD Commit</TooltipContent>
                                            </Tooltip>
                                            Fixed HEAD Commit
                                        </Label>
                                        <span className="font-mono">{initialHead.slice(0, 7)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Label>
                                            From:
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Eye className="inline-block mr-2 cursor-pointer"/>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">Choose a different base for preview
                                                    only</TooltipContent>
                                            </Tooltip>
                                            Choose a different base for preview
                                            only
                                        </Label>
                                        <select
                                            className="p-2 border rounded bg-white text-gray-900
dark:bg-gray-800 dark:text-gray-100
border-gray-300 dark:border-gray-700
focus:ring-2 focus:ring-blue-500"
                                            value={previewBase}
                                            onChange={(e) => setPreviewBase(e.target.value)}
                                        >
                                            {loadingCommits
                                                ? <option>Loading…</option>
                                                : commits.map(c => (
                                                    <option key={c.sha} value={c.sha}>
                                                        {c.sha.slice(0, 7)} — {c.message}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <div className="flex gap-4">
                                        {/* Files */}
                                        <div className="w-1/3">
                                            <h3 className="font-semibold mb-2">Files</h3>
                                            <ScrollArea className="h-72 p-2 border rounded">
                                                <TreeView
                                                    nodes={previewTree}
                                                    expanded={previewExpanded}
                                                    onToggle={p => toggleExp(true, p)}
                                                    selected={selectedFiles}
                                                    toggleFile={() => {
                                                    }}
                                                    onHighlight={f => setHighlighted(f)}
                                                />
                                            </ScrollArea>
                                        </div>

                                        {/* Diff + Expand */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold">Diff</h3>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="icon" variant="outline" aria-label="Expand diff">
                                                            <Maximize2 className="h-5 w-5"/>
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
                                                        {/* Header */}
                                                        <div className="flex items-center justify-between px-6 py-4 border-b">
                                                            <DialogTitle className="text-xl font-semibold">
                                                                File Diff Preview
                                                            </DialogTitle>
                                                            <DialogClose aria-label="Close"
                                                                         className="text-gray-500 hover:text-gray-700"/>
                                                        </div>

                                                        {/* Body */}
                                                        <div
                                                            className="
    flex-1 h-72 overflow-auto border rounded p-4
    bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100
    /* force added/removed lines to use normal text color */
    [&_.dv-content-add]:text-gray-900 dark:[&_.dv-content-add]:text-gray-100
    [&_.dv-content-del]:text-gray-900 dark:[&_.dv-content-del]:text-gray-100
  "
                                                        >
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
focus:ring-2 focus:ring-blue-500">
                                                {highlighted
                                                    ? <DiffViewer {...highlighted} />
                                                    : <p className="text-gray-500 dark:text-gray-400">
                                                        Select a file to view its diff
                                                    </p>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end mt-6">
                                <Button size="lg" onClick={handleGenerate}>
                                    Generate JAR
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
