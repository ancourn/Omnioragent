'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Braces, Hash, String, Boolean, Array } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
  level?: number;
  isRoot?: boolean;
}

export function JsonViewer({ data, title, level = 0, isRoot = false }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getIcon = (value: any) => {
    if (value === null) return <Hash className="h-3 w-3" />;
    if (typeof value === 'boolean') return <Boolean className="h-3 w-3" />;
    if (typeof value === 'string') return <String className="h-3 w-3" />;
    if (typeof value === 'number') return <Hash className="h-3 w-3" />;
    if (Array.isArray(value)) return <Array className="h-3 w-3" />;
    if (typeof value === 'object') return <Braces className="h-3 w-3" />;
    return <FileText className="h-3 w-3" />;
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return value.toString();
    return typeof value;
  };

  const renderValue = (value: any, key?: string, index?: number) => {
    const indent = '  '.repeat(level);
    const childIndent = '  '.repeat(level + 1);

    if (value === null || typeof value !== 'object') {
      return (
        <div className="flex items-center gap-2">
          {key && <span className="text-blue-400">{key}:</span>}
          <span className="text-green-400">{formatValue(value)}</span>
        </div>
      );
    }

    const isArray = Array.isArray(value);
    const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;
    const itemCount = isArray ? value.length : Object.keys(value).length;

    if (isEmpty) {
      return (
        <div className="flex items-center gap-2">
          {key && <span className="text-blue-400">{key}:</span>}
          <span className="text-gray-400">{isArray ? '[]' : '{}'}</span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-1 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-400" />
          )}
          {getIcon(value)}
          {key && <span className="text-blue-400">{key}:</span>}
          <span className="text-gray-400">
            {isArray ? `[${itemCount}]` : `{${itemCount}}`}
          </span>
        </div>
        
        {isExpanded && (
          <div className="ml-4 border-l border-gray-700 pl-2">
            {isArray ? (
              value.map((item, idx) => (
                <div key={idx} className="py-1">
                  {renderValue(item, undefined, idx)}
                </div>
              ))
            ) : (
              Object.entries(value).map(([k, v]) => (
                <div key={k} className="py-1">
                  <JsonViewer 
                    data={v} 
                    level={level + 1} 
                    key={k}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (isRoot && title) {
    return (
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div 
          className="flex items-center gap-2 p-3 bg-gray-900 cursor-pointer hover:bg-gray-800"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <FileText className="h-4 w-4" />
          <span className="font-medium text-white">{title}</span>
          <span className="text-gray-400 text-sm">
            {typeof data === 'object' ? 
              (Array.isArray(data) ? `[${data.length}]` : `{${Object.keys(data).length}}`) : 
              typeof data
            }
          </span>
        </div>
        
        {isExpanded && (
          <div className="p-4 bg-black">
            {renderValue(data)}
          </div>
        )}
      </div>
    );
  }

  return renderValue(data);
}

// Diff Viewer Component
interface DiffViewerProps {
  oldData: any;
  newData: any;
  title?: string;
}

export function DiffViewer({ oldData, newData, title }: DiffViewerProps) {
  const [showOld, setShowOld] = useState(true);
  const [showNew, setShowNew] = useState(true);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-900">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium text-white">{title}</span>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={showOld}
              onChange={(e) => setShowOld(e.target.checked)}
              className="rounded"
            />
            <span className="text-red-400">Old</span>
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={showNew}
              onChange={(e) => setShowNew(e.target.checked)}
              className="rounded"
            />
            <span className="text-green-400">New</span>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2">
        {showOld && (
          <div className="border-r border-gray-700">
            <div className="p-2 bg-red-900/20 text-red-400 text-sm font-medium">Old Version</div>
            <div className="p-4 bg-black">
              <JsonViewer data={oldData} />
            </div>
          </div>
        )}
        {showNew && (
          <div>
            <div className="p-2 bg-green-900/20 text-green-400 text-sm font-medium">New Version</div>
            <div className="p-4 bg-black">
              <JsonViewer data={newData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}