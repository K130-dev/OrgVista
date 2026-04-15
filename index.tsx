import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChevronRight, ChevronDown, Users, Briefcase, Award, Building2, 
  List, Plus, Minus, Search, Globe, Filter,
  ZoomIn, ZoomOut, PanelRightClose, PanelRightOpen, MapPin, 
  Home, Loader2, MousePointerClick, PanelLeftOpen, PanelLeftClose, X,
  Check, CheckSquare, Square
} from 'lucide-react';

// --- Types ---

interface Member {
  id: string;
  name: string;
  rank: string;
  position: string;
  country: string;
  isLeader?: boolean;
}

interface OrgNode {
  id: string;
  name: string;
  type?: string;
  children?: OrgNode[];
  members?: Member[];
}

// --- Utils ---

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// --- Shared Components ---

const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const initials = member.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  
  return (
    <div className={`flex items-start p-4 mb-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group ${member.isLeader ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${member.isLeader ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'}`}>
        {initials}
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-lg font-bold leading-tight truncate ${member.isLeader ? 'text-blue-600' : 'text-gray-900'}`}>{member.name}</h3>
          {member.isLeader && <span className="flex-shrink-0 text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Leader</span>}
        </div>
        
        {member.position && (
          <div className="mt-1 flex items-center text-sm text-gray-600 font-medium truncate">
            <Briefcase size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate" title={member.position}>{member.position}</span>
          </div>
        )}
        
        {member.rank && (
          <div className="mt-1 flex items-center text-sm text-gray-400 font-semibold">
            <Award size={14} className="mr-1.5 opacity-70 flex-shrink-0" />
            {member.rank}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-2">
          {member.country ? (
            <div className="flex items-center text-xs text-gray-400">
              <MapPin size={12} className="mr-1" />
              {member.country}
            </div>
          ) : (
             <div className="flex items-center text-xs text-transparent select-none">.</div>
          )}
          <div className="text-[10px] text-gray-400 font-mono ml-auto">
            ID: {member.id}
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingScreen = ({ onEnter, isLoading }: { onEnter: () => void, isLoading: boolean }) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-gray-400 bg-slate-50 px-4 py-12 overflow-y-auto">
    <div className="mb-10 text-center animate-in fade-in zoom-in duration-700">
      <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
        <Building2 size={48} className="text-white" />
      </div>
      <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">OrgVista</h2>
      <p className="text-xl text-blue-600 font-bold tracking-wide uppercase">企业级组织架构透视专家</p>
    </div>

    <div className="flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-700 delay-150">
      <div className="text-center mb-8 mt-2 px-6">
        <p className="text-gray-500 font-medium leading-relaxed">
           一键构建全景组织视图，深入洞察企业人才分布与层级关系。
        </p>
      </div>
      
      <button 
        onClick={onEnter} 
        disabled={isLoading}
        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all flex items-center justify-center transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? <Loader2 size={24} className="mr-3 animate-spin"/> : <MousePointerClick size={24} className="mr-3"/>}
        {isLoading ? '正在构建视图...' : '点击进入'}
      </button>
    </div>
    
    <div className="mt-12 text-xs font-bold text-gray-300 uppercase tracking-widest">
      Enterprise Edition v2.8.4
    </div>
  </div>
);

// --- View Components ---

interface TreeNodeProps {
  node: OrgNode;
  level: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: OrgNode) => void;
  searchTerm: string;
  visibleNodeIds: Set<string>;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, expandedIds, selectedId, onToggle, onSelect, searchTerm, visibleNodeIds }) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  if (!visibleNodeIds.has(node.id)) return null;

  return (
    <div className="select-none min-w-full">
      <div 
        className={`
          group flex items-center py-2 px-3 cursor-pointer transition-all duration-150 ease-in-out border-l-4 rounded-r-lg
          ${isSelected 
            ? 'bg-blue-50 border-blue-600 text-blue-700' 
            : 'border-transparent hover:bg-gray-100 text-gray-700'}
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelect(node)}
      >
        <div 
          className={`mr-1.5 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        
        <div className={`mr-2 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
          <Building2 size={16} />
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-800' : ''}`}>
            {node.name}
          </span>
          {node.type && <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-0.5 leading-none">{node.type}</span>}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="w-full">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
              searchTerm={searchTerm}
              visibleNodeIds={visibleNodeIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OrgChartNodeProps {
  node: OrgNode;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: OrgNode) => void;
  visibleNodeIds: Set<string>;
}

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, expandedIds, selectedId, onToggle, onSelect, visibleNodeIds }) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const leader = node.members?.find(m => m.isLeader);

  if (!visibleNodeIds.has(node.id)) return null;

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={(e) => { e.stopPropagation(); onSelect(node); }}
        className={`
          relative z-10 w-64 p-6 rounded-[1.5rem] shadow-sm border-2 cursor-pointer transition-all duration-300 hover:shadow-xl
          flex flex-col items-center text-center bg-white transform
          ${isSelected ? 'border-blue-600 ring-4 ring-blue-50 scale-105 shadow-lg' : 'border-gray-100 hover:border-blue-200'}
        `}
      >
        <h3 className={`font-black text-xl mb-0.5 leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
          {node.name}
        </h3>
        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-4">
          ID: {node.id}
        </div>
        <div className="mt-2 pt-4 border-t border-gray-100 w-full flex flex-col items-center justify-center">
          {leader ? (
            <>
              <div className="text-base text-blue-600 font-black truncate w-full" title={leader.name}>{leader.name}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium px-2 truncate w-full text-center" title={leader.position}>{leader.position}</div>
            </>
          ) : (
            <div className="text-sm text-gray-300 italic py-2">No leader</div>
          )}
        </div>
        {hasChildren && node.children?.some(c => visibleNodeIds.has(c.id)) && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className={`
              absolute -bottom-3.5 left-1/2 transform -translate-x-1/2
              w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs
              shadow-lg transition-all z-20 hover:scale-110
              ${isExpanded ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col items-center animate-in fade-in duration-300 zoom-in-95">
          <div className="w-0.5 h-10 bg-gray-200"></div>
          <div className="flex px-4">
            {node.children!.map((child, index, arr) => {
              if (!visibleNodeIds.has(child.id)) return null;
              
              const visibleChildren = arr.filter(c => visibleNodeIds.has(c.id));
              const visibleIndex = visibleChildren.indexOf(child);

              return (
                <div key={child.id} className="flex flex-col items-center relative px-4">
                  {visibleChildren.length > 1 && (
                    <>
                      <div className={`absolute top-0 right-0 h-0.5 bg-gray-200 w-1/2 ${visibleIndex === visibleChildren.length - 1 ? 'hidden' : 'block'}`}></div>
                      <div className={`absolute top-0 left-0 h-0.5 bg-gray-200 w-1/2 ${visibleIndex === 0 ? 'hidden' : 'block'}`}></div>
                    </>
                  )}
                  <div className="w-0.5 h-10 bg-gray-200"></div>
                  <OrgChartNode node={child} expandedIds={expandedIds} selectedId={selectedId} onToggle={onToggle} onSelect={onSelect} visibleNodeIds={visibleNodeIds} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Custom Multi-Select Dropdown ---

interface CountrySelectorProps {
  countries: string[];
  selectedCountries: Set<string>;
  onToggle: (country: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ countries, selectedCountries, onToggle, onSelectAll, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const allSelected = selectedCountries.size === countries.length;
  const noneSelected = selectedCountries.size === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm transition-all hover:bg-white hover:shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${isOpen ? 'ring-2 ring-blue-500 bg-white' : ''}`}
      >
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
        <span className="truncate mr-2 font-medium">
          {noneSelected ? '全部国家/地区' : allSelected ? '已选全部' : `已选 ${selectedCountries.size} 个`}
        </span>
        <ChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={14}/>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <button 
              onClick={onSelectAll}
              className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {allSelected ? <CheckSquare size={12} className="mr-1.5" /> : <Square size={12} className="mr-1.5" />}
              全选
            </button>
            <button 
              onClick={onClear}
              className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={12} className="mr-1.5" />
              重置
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {countries.map(country => {
              const isSelected = selectedCountries.has(country);
              return (
                <label 
                  key={country}
                  className={`flex items-center px-4 py-2.5 rounded-xl cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isSelected}
                    onChange={() => onToggle(country)}
                  />
                  <span className={`text-sm truncate ${isSelected ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                    {country}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [orgData, setOrgData] = useState<OrgNode | null>(null);
  const [displayRoot, setDisplayRoot] = useState<OrgNode | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [listSidebarOpen, setListSidebarOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [countries, setCountries] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleNode = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country); else next.add(country);
      return next;
    });
  };

  const handleSelectAllCountries = () => {
    if (selectedCountries.size === countries.length) setSelectedCountries(new Set());
    else setSelectedCountries(new Set(countries));
  };

  const handleListSelect = (node: OrgNode) => {
    setSelectedNode(node);
    setDisplayRoot(node);
    setExpandedIds(prev => new Set(prev).add(node.id));
    if (!isRightSidebarOpen) setIsRightSidebarOpen(true);
    setPan({ x: 0, y: 0 });
    setZoomLevel(1.0);
  };

  const handleChartSelect = (node: OrgNode) => {
    setSelectedNode(node);
    if (!isRightSidebarOpen) setIsRightSidebarOpen(true);
  };

  const visibleNodeIds = useMemo(() => {
    if (!orgData) return new Set<string>();
    
    const visibleSet = new Set<string>();

    const checkVisibility = (node: OrgNode): boolean => {
      let isVisible = false;

      const nameMatch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || node.id.toLowerCase().includes(searchTerm.toLowerCase());
      const countryMatch = selectedCountries.size === 0 || node.members?.some(m => selectedCountries.has(m.country));

      if (searchTerm) {
        if (nameMatch && countryMatch) isVisible = true;
      } else {
        if (countryMatch) isVisible = true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (checkVisibility(child)) isVisible = true;
        }
      }

      if (isVisible) visibleSet.add(node.id);
      return isVisible;
    };

    checkVisibility(orgData);
    return visibleSet;
  }, [orgData, searchTerm, selectedCountries]);

  const loadAndEnter = async () => {
    setIsLoading(true);
    try {
      const [structRes, empRes] = await Promise.all([fetch('./structure.csv'), fetch('./employee.csv')]);
      if (!structRes.ok || !empRes.ok) throw new Error('Failed to fetch data');
      const structText = await structRes.text();
      const empText = await empRes.text();

      const structLines = structText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (structLines.length < 1) throw new Error('Structure CSV empty');
      let structStart = structLines[0].toLowerCase().includes('org_id') ? 1 : 0;

      const nodesMap = new Map<string, OrgNode>();
      const parentMap = new Map<string, string>();
      const allCountries = new Set<string>();

      for (let i = structStart; i < structLines.length; i++) {
        const parts = parseCSVLine(structLines[i]);
        if (parts.length < 9) continue;
        const [id, name, pId, type, lCode, lName, lLevel, lPos, lCountry] = parts;
        const members: Member[] = lName ? [{ id: lCode || `L-${id}`, name: lName, rank: lLevel, position: lPos, country: lCountry, isLeader: true }] : [];
        if (lCountry) allCountries.add(lCountry);
        nodesMap.set(id, { id, name, type, children: [], members });
        parentMap.set(id, pId);
      }

      const empLines = empText.split(/\r?\n/).filter(line => line.trim() !== '');
      let empStart = empLines[0]?.toLowerCase().includes('org_id') ? 1 : 0;
      for (let i = empStart; i < empLines.length; i++) {
        const parts = parseCSVLine(empLines[i]);
        if (parts.length < 7) continue;
        const [oId, , eCode, eName, level, position, country] = parts;
        if (country) allCountries.add(country);
        const node = nodesMap.get(oId);
        if (node) {
          if (!node.members!.some(m => m.id === eCode)) {
            node.members!.push({ id: eCode, name: eName, rank: level, position, country, isLeader: false });
          }
        }
      }

      let roots: OrgNode[] = [];
      nodesMap.forEach((node, id) => {
        const pId = parentMap.get(id);
        if (!pId || !nodesMap.has(pId)) roots.push(node);
        else nodesMap.get(pId)!.children!.push(node);
      });

      const root = roots.length === 1 ? roots[0] : { id: 'root', name: 'Global Hierarchy', type: 'Global', children: roots, members: [] };
      setOrgData(root);
      setDisplayRoot(root);
      setCountries(Array.from(allCountries).sort());
      setExpandedIds(new Set([root.id]));
      setIsViewing(true);
      setListSidebarOpen(true);
    } catch (e) { console.error(e); alert("Data error."); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 flex items-center justify-between px-8 border-b border-gray-200 bg-white sticky top-0 z-50 shrink-0 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-2xl mr-4 shadow-lg shadow-blue-100 transform hover:rotate-3 transition-transform">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">OrgVista</h1>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">Enterprise Hierarchy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isRightSidebarOpen && isViewing && (
              <button onClick={() => setIsRightSidebarOpen(true)} className="p-3 text-slate-700 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 rounded-xl flex items-center transition-all">
                <PanelRightOpen size={20} className="mr-2 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-wider">人员详情</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden bg-slate-100 relative">
          {!isViewing ? <LandingScreen onEnter={loadAndEnter} isLoading={isLoading} /> : (
            <>
              <div className={`h-full flex flex-col bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out z-40 overflow-hidden shrink-0 ${listSidebarOpen ? 'w-96' : 'w-0'}`}>
                <div className={`h-full flex flex-col w-96`}>
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between h-14 shrink-0 whitespace-nowrap">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center"><List size={14} className="mr-2 opacity-50"/> 组织列表</h3>
                    <button onClick={() => setListSidebarOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"><PanelLeftClose size={18} /></button>
                  </div>
                  
                  <div className="p-4 border-b border-gray-100 space-y-3 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                      <input type="text" placeholder="搜索单位名称或ID..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    
                    <CountrySelector 
                      countries={countries} 
                      selectedCountries={selectedCountries} 
                      onToggle={toggleCountry} 
                      onSelectAll={handleSelectAllCountries}
                      onClear={() => setSelectedCountries(new Set())}
                    />
                  </div>

                  <div className="flex-1 overflow-auto custom-scrollbar p-3">
                    <TreeNode node={orgData!} level={0} expandedIds={expandedIds} selectedId={selectedNode?.id || null} onToggle={handleToggleNode} onSelect={handleListSelect} searchTerm={searchTerm} visibleNodeIds={visibleNodeIds} />
                  </div>
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden bg-slate-100">
                {!listSidebarOpen && (
                  <div className="absolute top-6 left-6 z-30 animate-in fade-in slide-in-from-left-2 duration-300">
                    <button onClick={() => setListSidebarOpen(true)} className="p-3 bg-white text-slate-700 shadow-lg border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-all flex items-center">
                      <PanelLeftOpen size={20} className="mr-2"/>
                      <span className="text-xs font-black uppercase tracking-wider">组织列表</span>
                    </button>
                  </div>
                )}

                {/* Optimized Floating Toolbar Layout */}
                <div className={`absolute top-6 ${listSidebarOpen ? 'left-6' : 'left-40'} z-20 transition-all duration-300 flex items-center gap-3 pointer-events-none`}>
                  {displayRoot && displayRoot.id !== orgData?.id && (
                    <div className="flex items-center bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200/60 animate-in fade-in pointer-events-auto">
                      <button onClick={() => { setDisplayRoot(orgData); setPan({ x: 0, y: 0 }); setZoomLevel(1.0); setSelectedNode(orgData); }} className="flex items-center text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"><Home size={14} className="mr-1.5" /> Root</button>
                      <ChevronRight size={14} className="mx-2 text-gray-300" />
                      <div className="text-xs font-black text-slate-800 flex items-center"><Building2 size={14} className="mr-2 text-blue-500"/> {displayRoot.name}</div>
                    </div>
                  )}
                  {selectedCountries.size > 0 && selectedCountries.size < countries.length && (
                    <div className="flex items-center bg-blue-600/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-200/50 text-[10px] font-black uppercase tracking-widest animate-in zoom-in pointer-events-auto border border-blue-500">
                      <Globe size={12} className="mr-2"/> 
                      已选国家/地区 ({selectedCountries.size})
                      <button onClick={() => setSelectedCountries(new Set())} className="ml-2 pl-2 border-l border-white/20 hover:text-white/70 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  className={`w-full h-full relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
                  onMouseDown={(e) => { if (e.button !== 0) return; setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }} 
                  onMouseMove={(e) => { if (!isDragging) return; e.preventDefault(); setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }} 
                  onMouseUp={() => setIsDragging(false)} 
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <div className="absolute bottom-10 left-10 flex flex-col bg-white/90 backdrop-blur rounded-2xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
                    <button onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(prev + 0.1, 2.5)); }} className="p-4 hover:bg-blue-50 text-gray-600 border-b border-gray-100 transition-colors"><ZoomIn size={20} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setZoomLevel(1.0); setPan({ x: 0, y: 0 }); }} className="p-4 bg-blue-50/30 text-blue-600 border-b border-gray-100 flex items-center justify-center font-black text-xs">{Math.round(zoomLevel * 100)}%</button>
                    <button onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(prev - 0.1, 0.3)); }} className="p-4 hover:bg-blue-50 text-gray-600 transition-colors"><ZoomOut size={20} /></button>
                  </div>
                  <div className={`w-full h-full flex justify-center pt-24 origin-top ${isDragging ? '' : 'transition-transform duration-300'}`} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})` }}>
                    <OrgChartNode node={displayRoot || orgData!} expandedIds={expandedIds} selectedId={selectedNode?.id || null} onToggle={handleToggleNode} onSelect={handleChartSelect} visibleNodeIds={visibleNodeIds} />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
        
        {isViewing && (
          <footer className="h-10 border-t border-gray-200 bg-white flex items-center px-8 text-[10px] text-gray-400 shrink-0 z-50 font-black tracking-widest uppercase">
            <span className="text-blue-600">Enterprise Edition v2.8.4</span>
          </footer>
        )}
      </div>

      <aside className={`flex flex-col bg-white shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)] z-[60] border-l border-gray-200 shrink-0 transition-all duration-500 ease-in-out ${isRightSidebarOpen ? 'w-[450px] translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 shrink-0 min-w-[450px]">
          <h2 className="text-xl font-black text-slate-800 flex items-center"><Users className="mr-3 text-indigo-600" size={24} /> 人员信息</h2>
          <div className="flex items-center space-x-3">
            {selectedNode?.members && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">
                {selectedNode.members.filter(m => !m.isLeader && (selectedCountries.size === 0 || selectedCountries.has(m.country))).length} 成员
              </span>
            )}
            <button onClick={() => setIsRightSidebarOpen(false)} className="text-gray-400 hover:text-slate-800 p-2 hover:bg-gray-100 rounded-xl transition-all"><PanelRightClose size={24} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar min-w-[450px]">
          {selectedNode ? (
            <>
              <div className="mb-10 p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Building2 size={80} /></div>
                <div className="relative z-10">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-black mb-3">已选择单位</div>
                  <p className="text-3xl font-black leading-tight mb-4">{selectedNode.name}</p>
                  <div className="flex items-center space-x-3">
                     <span className="bg-blue-600/30 backdrop-blur text-[10px] font-black px-3 py-1.5 rounded-lg uppercase border border-blue-400/20 text-blue-100">{selectedNode.type || 'Unit'}</span>
                     <span className="text-[10px] font-mono font-bold opacity-60">ID: {selectedNode.id}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">
                  {selectedCountries.size > 0 && selectedCountries.size < countries.length ? '多选筛选下员工花名册' : '员工花名册'}
                </h3>
                {(() => {
                  const filteredMembers = selectedNode.members?.filter(m => selectedCountries.size === 0 || selectedCountries.has(m.country)) || [];
                  if (filteredMembers.length === 0) {
                    return (
                      <div className="text-center py-20 text-gray-300 font-bold bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                        该单位在所选区域暂无人员
                      </div>
                    );
                  }
                  return [...filteredMembers]
                    .sort((a,b) => (a.isLeader === b.isLeader ? 0 : a.isLeader ? -1 : 1))
                    .map(member => <MemberCard key={member.id} member={member} />);
                })()}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 px-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-dashed border-slate-200"><Building2 size={48} className="opacity-10" /></div>
              <p className="text-2xl font-black text-slate-800">请选择单位</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}