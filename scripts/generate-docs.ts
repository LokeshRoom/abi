// scripts/generate-docs.ts

import * as fs from 'fs';
import * as path from 'path';

const componentsDir = path.resolve(process.cwd(), 'components');
const docsPath = path.resolve(process.cwd(), 'docs', 'components.md');

// Helper to recursively walk a directory and return all .tsx files
function getTsxFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsxFiles(fullPath));
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

interface ComponentProp {
  name: string;
  type: string;
  isOptional: boolean;
  comment: string;
}

interface ComponentInfo {
  name: string;
  filePath: string;
  category: string;
  description: string;
  props: ComponentProp[];
}

function getInterfaceBlock(content: string, componentName: string): string | null {
  const startRegex = new RegExp(`(?:interface\\s+${componentName}Props\\s*{|type\\s+${componentName}Props\\s*=\\s*{)`, 'm');
  const match = startRegex.exec(content);
  if (!match) return null;
  
  const startIdx = match.index + match[0].length;
  let braceCount = 1;
  let i = startIdx;
  
  while (i < content.length && braceCount > 0) {
    if (content[i] === '{') braceCount++;
    else if (content[i] === '}') braceCount--;
    i++;
  }
  
  if (braceCount === 0) {
    return content.substring(startIdx, i - 1);
  }
  return null;
}

function parseProps(content: string, componentName: string): ComponentProp[] {
  const propsList: ComponentProp[] = [];
  
  const propsBlock = getInterfaceBlock(content, componentName);
  if (!propsBlock) return propsList;
  
  // Parse the block character by character to handle nested braces and semicolons correctly
  let i = 0;
  while (i < propsBlock.length) {
    // 1. Skip whitespace
    while (i < propsBlock.length && /\s/.test(propsBlock[i])) {
      i++;
    }
    if (i >= propsBlock.length) break;
    
    // 2. Parse comments before the prop (could be JSDoc /** ... */ or single line // ...)
    let comment = '';
    if (propsBlock.startsWith('/**', i)) {
      const endJSDoc = propsBlock.indexOf('*/', i);
      if (endJSDoc !== -1) {
        comment = propsBlock.substring(i + 3, endJSDoc)
          .replace(/^\s*\*\s?/gm, '')
          .trim();
        i = endJSDoc + 2;
      }
    } else if (propsBlock.startsWith('//', i)) {
      const endLine = propsBlock.indexOf('\n', i);
      if (endLine !== -1) {
        comment = propsBlock.substring(i + 2, endLine).trim();
        i = endLine + 1;
      } else {
        comment = propsBlock.substring(i + 2).trim();
        i = propsBlock.length;
      }
    }
    
    // Skip whitespace after comments
    while (i < propsBlock.length && /\s/.test(propsBlock[i])) {
      i++;
    }
    if (i >= propsBlock.length) break;
    
    // If it starts with another comment, loop back to parse it
    if (propsBlock.startsWith('/**', i) || propsBlock.startsWith('//', i)) {
      continue;
    }
    
    // 3. Parse prop name
    const nameStart = i;
    while (i < propsBlock.length && /[\w$]/.test(propsBlock[i])) {
      i++;
    }
    const propName = propsBlock.substring(nameStart, i);
    if (!propName) {
      i++;
      continue;
    }
    
    // 4. Parse optional question mark
    let isOptional = false;
    if (propsBlock[i] === '?') {
      isOptional = true;
      i++;
    }
    
    // 5. Skip whitespace and colon
    while (i < propsBlock.length && /\s/.test(propsBlock[i])) {
      i++;
    }
    if (propsBlock[i] !== ':') {
      continue;
    }
    i++; // skip ':'
    
    // 6. Parse the type (consume until we find a delimiter: semicolon, comma, or newline at the outer level of braces/parentheses)
    while (i < propsBlock.length && /\s/.test(propsBlock[i])) {
      i++;
    }
    const typeStart = i;
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    
    while (i < propsBlock.length) {
      const char = propsBlock[i];
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
      
      if (braceCount === 0 && parenCount === 0 && bracketCount === 0) {
        if (char === ';' || char === ',' || char === '\n') {
          break;
        }
      }
      i++;
    }
    const propType = propsBlock.substring(typeStart, i).trim();
    
    // Skip the delimiter
    if (i < propsBlock.length && (propsBlock[i] === ';' || propsBlock[i] === ',')) {
      i++;
    }
    
    propsList.push({
      name: propName,
      type: propType,
      isOptional,
      comment
    });
  }
  
  return propsList;
}

function parseComponent(filePath: string): ComponentInfo[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  
  // Extract category based on immediate subfolder under components
  const pathParts = relativePath.split('/');
  const categoryIndex = pathParts.indexOf('components');
  const category = (categoryIndex !== -1 && pathParts[categoryIndex + 1]) 
    ? pathParts[categoryIndex + 1] 
    : 'general';
  
  // Find components exported via function or const
  // Handles:
  // export function MyComponent(...)
  // export const MyComponent = ...
  // export default function MyComponent(...)
  const exportRegex = /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/g;
  const components: ComponentInfo[] = [];
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    const componentName = match[1];
    
    // Find JSDoc comments or block comments right before this export
    const exportIndex = match.index;
    const preContent = content.substring(Math.max(0, exportIndex - 1000), exportIndex);
    
    // Check if there is a JSDoc block comment just before the export
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\/\s*$/;
    const jsDocMatch = jsDocRegex.exec(preContent.trim());
    let description = 'No description available.';
    if (jsDocMatch) {
      description = jsDocMatch[1].replace(/^\s*\*\s?/gm, '').trim();
    } else {
      // Fallback to simple line comments
      const lineCommentsRegex = /(?:\/\/[^\n]*\s*)+$/;
      const lineCommentsMatch = lineCommentsRegex.exec(preContent.trim());
      if (lineCommentsMatch) {
        description = lineCommentsMatch[0].replace(/\/\/\s?/g, '').trim();
      }
    }
    
    const props = parseProps(content, componentName);
    
    components.push({
      name: componentName,
      filePath: relativePath,
      category,
      description,
      props
    });
  }
  
  return components;
}

function generateMarkdown(components: ComponentInfo[]): string {
  let md = '# Component Reference\n\n';
  md += 'Welcome to the component reference guide. This document is auto-generated by scanning the components folder. It documents all React components, their props, and relative files.\n\n';
  
  // Group components by category
  const categories: { [key: string]: ComponentInfo[] } = {};
  for (const comp of components) {
    if (!categories[comp.category]) {
      categories[comp.category] = [];
    }
    categories[comp.category].push(comp);
  }
  
  // Sort categories alphabetically
  const sortedCategories = Object.keys(categories).sort();
  
  // Table of Contents
  md += '## Categories\n\n';
  for (const cat of sortedCategories) {
    const prettyCat = cat.charAt(0).toUpperCase() + cat.slice(1);
    md += `- [${prettyCat} Components](#${cat}-components)\n`;
  }
  md += '\n---\n\n';
  
  // Section for each category
  for (const cat of sortedCategories) {
    const prettyCat = cat.charAt(0).toUpperCase() + cat.slice(1);
    md += `## ${prettyCat} Components\n\n`;
    
    const comps = categories[cat];
    for (const comp of comps) {
      md += `### ${comp.name}\n\n`;
      md += `- **File Path:** [${path.basename(comp.filePath)}](file:///${path.resolve(process.cwd(), comp.filePath).replace(/\\/g, '/')})\n`;
      md += `- **Description:** ${comp.description}\n\n`;
      
      if (comp.props.length > 0) {
        md += '#### Props\n\n';
        md += '| Prop | Type | Required | Description |\n';
        md += '|---|---|---|---|\n';
        for (const prop of comp.props) {
          md += `| \`${prop.name}\` | \`${prop.type.replace(/\|/g, '\\|')}\` | \`${prop.isOptional ? 'No' : 'Yes'}\` | ${prop.comment || '-'} |\n`;
        }
        md += '\n';
      } else {
        md += '*This component does not accept props or utilizes custom state internally.*\n\n';
      }
      
      md += '#### Usage Example\n\n';
      md += '```tsx\n';
      md += `import { ${comp.name} } from "@/components/${comp.category}/${path.basename(comp.filePath, '.tsx')}";\n\n`;
      md += `// Example render:\n`;
      if (comp.props.length > 0) {
        md += `<${comp.name}\n`;
        for (const prop of comp.props.slice(0, 3)) {
          md += `  ${prop.name}={/* ... */}\n`;
        }
        md += '/>\n';
      } else {
        md += `<${comp.name} />\n`;
      }
      md += '```\n\n';
      md += '---\n\n';
    }
  }
  
  md += '*Generated automatically. Run `npm run doc:all` to update.*\n';
  return md;
}

function main() {
  console.log('Scanning components under:', componentsDir);
  const tsxFiles = getTsxFiles(componentsDir);
  console.log(`Found ${tsxFiles.length} component files.`);
  
  const allComponents: ComponentInfo[] = [];
  for (const file of tsxFiles) {
    const comps = parseComponent(file);
    allComponents.push(...comps);
  }
  
  console.log(`Extracted ${allComponents.length} component exports.`);
  
  const markdown = generateMarkdown(allComponents);
  
  // Ensure docs folder exists
  const docsDir = path.dirname(docsPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(docsPath, markdown, 'utf8');
  console.log('Component documentation successfully written to:', docsPath);
}

main();
