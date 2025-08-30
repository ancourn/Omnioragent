'use client';

import { useState } from 'react';
import { ArrowLeftRight, FileText, Eye, EyeOff } from 'lucide-react';

interface DiffViewerProps {
  original?: any;
  modified?: any;
  originalName?: string;
  modifiedName?: string;
}

interface DiffChange {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  oldValue?: any;
  newValue?: any;
}

export default function DiffViewer({ 
  original, 
  modified, 
  originalName = 'Original', 
  modifiedName = 'Modified' 
}: DiffViewerProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);

  const compareObjects = (obj1: any, obj2: any, path: string = ''): DiffChange[] => {
    const changes: DiffChange[] = [];
    
    if (obj1 === obj2) {
      changes.push({ type: 'unchanged', path, oldValue: obj1, newValue: obj2 });
      return changes;
    }

    if (obj1 === null || obj2 === null) {
      changes.push({ type: 'modified', path, oldValue: obj1, newValue: obj2 });
      return changes;
    }

    if (typeof obj1 !== typeof obj2) {
      changes.push({ type: 'modified', path, oldValue: obj1, newValue: obj2 });
      return changes;
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      changes.push({ type: 'modified', path, oldValue: obj1, newValue: obj2 });
      return changes;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        changes.push({ type: 'added', path: currentPath, newValue: obj2[key] });
      } else if (!(key in obj2)) {
        changes.push({ type: 'removed', path: currentPath, oldValue: obj1[key] });
      } else {
        changes.push(...compareObjects(obj1[key], obj2[key], currentPath));
      }
    }

    return changes;
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getChangeColor = (type: DiffChange['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'removed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'modified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getChangeIcon = (type: DiffChange['type']) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'modified':
        return '~';
      default:
        return '=';
    }
  };

  // Calculate differences when component mounts or props change
  if (original !== undefined && modified !== undefined && diffChanges.length === 0) {
    const changes = compareObjects(original, modified);
    setDiffChanges(changes);
  }

  const renderRawJson = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="border rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm">
          {originalName}
        </div>
        <pre className="p-4 text-sm overflow-auto max-h-96 bg-gray-900 text-green-400">
          {JSON.stringify(original, null, 2)}
        </pre>
      </div>
      <div className="border rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm">
          {modifiedName}
        </div>
        <pre className="p-4 text-sm overflow-auto max-h-96 bg-gray-900 text-green-400">
          {JSON.stringify(modified, null, 2)}
        </pre>
      </div>
    </div>
  );

  const renderDiffView = () => (
    <div className="space-y-2">
      {diffChanges.map((change, index) => (
        <div
          key={index}
          className={`border rounded-lg p-3 ${getChangeColor(change.type)}`}
        >
          <div className="flex items-center mb-2">
            <span className="font-mono text-sm font-bold mr-2">
              {getChangeIcon(change.type)}
            </span>
            <span className="font-mono text-sm font-medium">
              {change.path}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {change.oldValue !== undefined && (
              <div className="bg-white rounded p-2 border">
                <div className="text-xs text-gray-500 mb-1">Original:</div>
                <pre className="whitespace-pre-wrap break-all">
                  {formatValue(change.oldValue)}
                </pre>
              </div>
            )}
            {change.newValue !== undefined && (
              <div className="bg-white rounded p-2 border">
                <div className="text-xs text-gray-500 mb-1">Modified:</div>
                <pre className="whitespace-pre-wrap break-all">
                  {formatValue(change.newValue)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ArrowLeftRight className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Diff Viewer</h3>
        </div>
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="flex items-center space-x-2 px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
        >
          {showRawJson ? (
            <>
              <Eye className="w-4 h-4" />
              <span>Show Diff</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Show Raw JSON</span>
            </>
          )}
        </button>
      </div>

      {original === undefined || modified === undefined ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select two artifacts to compare</p>
        </div>
      ) : (
        showRawJson ? renderRawJson() : renderDiffView()
      )}
    </div>
  );
}