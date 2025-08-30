'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Braces, FileText, Folder, FolderOpen } from 'lucide-react';

interface JsonTreeViewerProps {
  data: any;
  name?: string;
  level?: number;
  isRoot?: boolean;
}

interface TreeNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string;
}

export default function JsonTreeViewer({ data, name = 'root', level = 0, isRoot = true }: JsonTreeViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(isRoot ? { [name]: true } : {});
  const [copiedPath, setCopiedPath] = useState<string>('');

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const getType = (value: any): TreeNode['type'] => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'null';
  };

  const formatValue = (value: any, type: TreeNode['type']) => {
    switch (type) {
      case 'string':
        return `"${value}"`;
      case 'number':
        return value.toString();
      case 'boolean':
        return value ? 'true' : 'false';
      case 'null':
        return 'null';
      default:
        return '';
    }
  };

  const getValueColor = (type: TreeNode['type']) => {
    switch (type) {
      case 'string':
        return 'text-green-600';
      case 'number':
        return 'text-blue-600';
      case 'boolean':
        return 'text-purple-600';
      case 'null':
        return 'text-gray-500';
      default:
        return 'text-gray-800';
    }
  };

  const renderNode = (key: string, value: any, path: string, nodeLevel: number) => {
    const type = getType(value);
    const isExpanded = expanded[path];
    const hasChildren = type === 'object' || type === 'array';
    const indent = nodeLevel * 20;

    if (hasChildren) {
      const childCount = type === 'object' ? Object.keys(value).length : value.length;
      
      return (
        <div key={path} className="select-none">
          <div 
            className="flex items-center py-1 hover:bg-gray-50 cursor-pointer rounded"
            style={{ paddingLeft: `${indent}px` }}
            onClick={() => toggleExpand(path)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 mr-1" />
            )}
            {type === 'object' ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500 mr-1" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500 mr-1" />
              )
            ) : (
              <Braces className="w-4 h-4 text-orange-500 mr-1" />
            )}
            <span className="text-gray-700 font-medium">{key}</span>
            <span className="text-gray-500 ml-2">
              {type === 'object' ? `{${childCount}}` : `[${childCount}]`}
            </span>
          </div>
          
          {isExpanded && (
            <div>
              {type === 'object' ? (
                Object.entries(value).map(([childKey, childValue]) => 
                  renderNode(childKey, childValue, `${path}.${childKey}`, nodeLevel + 1)
                )
              ) : (
                value.map((item: any, index: number) => 
                  renderNode(index.toString(), item, `${path}[${index}]`, nodeLevel + 1)
                )
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        key={path} 
        className="flex items-center py-1 hover:bg-gray-50 rounded group"
        style={{ paddingLeft: `${indent}px` }}
      >
        <div className="w-4 h-4 mr-1" />
        <FileText className="w-4 h-4 text-gray-400 mr-1" />
        <span className="text-gray-700 font-medium mr-2">{key}:</span>
        <span className={getValueColor(type)}>
          {formatValue(value, type)}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(formatValue(value, type));
            setCopiedPath(path);
            setTimeout(() => setCopiedPath(''), 2000);
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
        >
          {copiedPath === path ? '✓' : '📋'}
        </button>
      </div>
    );
  };

  return (
    <div className="font-mono text-sm bg-white border rounded-lg p-4 max-h-96 overflow-auto">
      {renderNode(name, data, name, level)}
    </div>
  );
}