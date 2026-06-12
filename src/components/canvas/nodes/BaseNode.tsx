import { Handle, Position } from '@xyflow/react';
import { Play, ArrowRightToLine, Zap, Braces, MessageSquare, Database } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  trigger: <Play size={20} />,
  response: <ArrowRightToLine size={20} />,
  llm: <Zap size={20} />,
  condition: <Braces size={20} />,
  output: <MessageSquare size={20} />,
  database: <Database size={20} />,
};

export interface BaseNodeData {
  label: string;
  iconType?: keyof typeof iconMap;
  subtitle?: string;
  hideInput?: boolean;
  hideOutput?: boolean;
}

interface BaseNodeProps {
  data: BaseNodeData;
  selected?: boolean;
}

export default function BaseNode({ data, selected }: BaseNodeProps) {
  return (
    <div
      className={`
        relative min-w-[240px] rounded-xl bg-zinc-950/90 backdrop-blur-xl 
        border transition-all duration-300 shadow-2xl
        ${selected ? 'border-blue-500/80 shadow-blue-500/20 ring-1 ring-blue-500/50' : 'border-zinc-800 hover:border-zinc-700'}
      `}
    >
      {!data.hideInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3.5 h-3.5 border-2 border-zinc-950 bg-blue-500 rounded-full !left-[-7px] transition-transform hover:scale-125"
        />
      )}

      <div className="p-4 flex items-center gap-3">
        {data.iconType && iconMap[data.iconType] && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/50 text-zinc-300 shadow-inner">
            {iconMap[data.iconType]}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-100 tracking-wide">
            {data.label}
          </span>
          {data.subtitle && (
            <span className="text-xs text-zinc-400 font-medium mt-0.5">
              {data.subtitle}
            </span>
          )}
        </div>
      </div>

      {!data.hideOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3.5 h-3.5 border-2 border-zinc-950 bg-blue-500 rounded-full !right-[-7px] transition-transform hover:scale-125"
        />
      )}
    </div>
  );
}
