
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui-custom/PageHeader';
import { FolderTree, File } from 'lucide-react';
import CodeEditor from '@/components/ui-custom/CodeEditor';

const CodeExplorer = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>('ServiceProxy.proxy');
  const [fileContent, setFileContent] = useState<string>(`<?xml version="1.0" encoding="UTF-8"?>
<con:businessServiceEntry xmlns:con="http://www.bea.com/wli/sb/services/business/config">
    <con:coreEntry>
        <con:binding type="SOAP" isSoap12="false" xsi:type="con:SoapBindingType" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <con:wsdl ref="CustomerServices/WSDL/CustomerService"/>
            <con:binding>
                <con:name>CustomerPortTypeSOAP11Binding</con:name>
                <con:namespace>http://example.org/customer-service</con:namespace>
            </con:binding>
            <con:WSI-compliant>false</con:WSI-compliant>
        </con:binding>
        <con:xqConfiguration>
            <con:snippetVersion>1.0</con:snippetVersion>
        </con:xqConfiguration>
    </con:coreEntry>
    <con:endpointConfig>
        <tran:provider-id xmlns:tran="http://www.bea.com/wli/sb/transports">http</tran:provider-id>
        <tran:inbound xmlns:tran="http://www.bea.com/wli/sb/transports">false</tran:inbound>
        <tran:URI xmlns:tran="http://www.bea.com/wli/sb/transports">
            <env:value xmlns:env="http://www.bea.com/wli/config/env">http://backend-services:8080/customer-service</env:value>
        </tran:URI>
        <tran:outbound-properties xmlns:tran="http://www.bea.com/wli/sb/transports">
            <tran:load-balancing-algorithm>round-robin</tran:load-balancing-algorithm>
            <tran:retry-count>0</tran:retry-count>
            <tran:retry-interval>30</tran:retry-interval>
        </tran:outbound-properties>
        <tran:provider-specific xmlns:tran="http://www.bea.com/wli/sb/transports">
            <http:outbound-properties xmlns:http="http://www.bea.com/wli/sb/transports/http">
                <http:request-method>POST</http:request-method>
                <http:timeout>0</http:timeout>
                <http:connection-timeout>0</http:connection-timeout>
                <http:follow-redirects>false</http:follow-redirects>
                <http:chunked-streaming-mode>true</http:chunked-streaming-mode>
                <http:session-sctikiness enabled="false" session-id-name="JSESSIONID"/>
            </http:outbound-properties>
        </tran:provider-specific>
    </con:endpointConfig>
</con:businessServiceEntry>`);

  // Sample file structure for the explorer
  const fileStructure = [
    {
      name: 'CustomerServices',
      type: 'folder',
      children: [
        {
          name: 'BusinessServices',
          type: 'folder',
          children: [
            { name: 'CustomerBusinessService.biz', type: 'file', language: 'xml' }
          ]
        },
        {
          name: 'ProxyServices',
          type: 'folder',
          children: [
            { name: 'CustomerProxyService.proxy', type: 'file', language: 'xml' },
            { name: 'ServiceProxy.proxy', type: 'file', language: 'xml' }
          ]
        },
        {
          name: 'WSDL',
          type: 'folder',
          children: [
            { name: 'CustomerService.wsdl', type: 'file', language: 'xml' }
          ]
        },
        {
          name: 'XSD',
          type: 'folder',
          children: [
            { name: 'CustomerSchema.xsd', type: 'file', language: 'xml' }
          ]
        }
      ]
    },
    {
      name: 'PaymentServices',
      type: 'folder',
      children: [
        {
          name: 'BusinessServices',
          type: 'folder',
          children: [
            { name: 'PaymentBusinessService.biz', type: 'file', language: 'xml' }
          ]
        },
        {
          name: 'ProxyServices',
          type: 'folder',
          children: [
            { name: 'PaymentProxyService.proxy', type: 'file', language: 'xml' }
          ]
        }
      ]
    }
  ];

  // Helper function to render the file tree
  const renderFileTree = (items: any[], level = 0) => {
    return items.map((item) => (
      <div key={item.name} className="ml-4">
        <div 
          className={`flex items-center gap-2 p-1 rounded hover:bg-muted ${
            selectedFile === item.name ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${level * 12}px` }}
        >
          {item.type === 'folder' ? (
            <FolderTree className="h-4 w-4" />
          ) : (
            <File className="h-4 w-4" />
          )}
          <span 
            className={`text-sm cursor-pointer ${
              item.type === 'file' ? 'hover:text-primary' : 'font-medium'
            }`}
            onClick={() => item.type === 'file' && setSelectedFile(item.name)}
          >
            {item.name}
          </span>
        </div>
        
        {item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Code Explorer" 
        description="Browse and edit OSB configuration files"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Project Files</h3>
            <div className="border rounded-md p-2 bg-muted/30 h-[500px] overflow-auto">
              {renderFileTree(fileStructure)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{selectedFile || 'Select a file'}</h3>
            <div className="h-[500px] border rounded-md overflow-hidden">
              {selectedFile ? (
                <CodeEditor
                  value={fileContent}
                  onChange={setFileContent}
                  language="xml"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a file from the explorer to view and edit
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeExplorer;
