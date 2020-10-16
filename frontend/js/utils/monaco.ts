
import testTypes from '!!raw-loader!../../assets/challengetests.d.ts';
import { monaco } from '@monaco-editor/react';

let monacoInitialized = false;

export function initMonaco() {
    if (!monacoInitialized) {
        monaco.config({
            paths: {
                vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.21.2/min/vs'
            }
        })
        
        monaco.init().then(async monaco => {
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
                lib: ["es2019"]
            });
            
            // Use typescript for tests
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                // Deliberately uses javascriptDefaults
                ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
                lib: ["es2019"]
            })
            monaco.languages.typescript.typescriptDefaults.addExtraLib(testTypes, "challengetests.d.ts");
        });
        monacoInitialized = true;
    }
}