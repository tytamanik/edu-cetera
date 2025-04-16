import React from "react";
import * as LucideIcons from "lucide-react";

/**
 * Renders a Lucide icon dynamically from a string name.
 * Handles kebab-case, camelCase, PascalCase, and falls back to BookOpen if not found.
 */
export interface LucideDynamicIconProps {
  icon?: string;
  className?: string;
}

function toPascalCase(str: string): string {
  // Converts kebab-case or snake_case to PascalCase
  return str
    .replace(/[-_]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (_, chr) => chr.toUpperCase());
}

export const LucideDynamicIcon: React.FC<LucideDynamicIconProps> = ({ icon, className = "" }) => {
  if (!icon) {
    const DefaultIcon = LucideIcons["BookOpen"];
    return <DefaultIcon className={className} />;
  }
  const pascalName = toPascalCase(icon);
  const LucideIcon = (LucideIcons as any)[pascalName] || LucideIcons["BookOpen"];
  return <LucideIcon className={className} />;
};

export default LucideDynamicIcon;
