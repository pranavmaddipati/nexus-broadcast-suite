import { Project, SyntaxKind, PropertyAccessExpression, CallExpression } from 'ts-morph';

const project = new Project({
    tsConfigFilePath: 'tsconfig.app.json',
});

const sourceFiles = project.getSourceFiles('src/**/*.tsx');

let modifications = 0;

sourceFiles.forEach(sourceFile => {
    let fileModified = false;

    // 1. Add (array || []) to array methods
    const arrayMethods = ['map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every'];
    
    // Iterate in reverse to avoid position shifting issues
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).reverse();

    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
            const propAccess = expression as PropertyAccessExpression;
            const methodName = propAccess.getName();
            
            if (arrayMethods.includes(methodName)) {
                const callee = propAccess.getExpression();
                const calleeText = callee.getText();
                
                // Skip if already safeguarded with || [] or ?? []
                if (!calleeText.includes('|| []') && !calleeText.includes('?? []')) {
                    // Replace callee with (callee || [])
                    callee.replaceWithText(`(${calleeText} || [])`);
                    fileModified = true;
                    modifications++;
                }
            }
        }
    }

    // 2. Add Optional Chaining to risky property accesses
    const riskyIdentifiers = ['scene', 'settings', 'dock', 'filters', 'sources', 'streams', 'source', 'currentScene', 'activeSource', 'item'];
    
    const propAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).reverse();
    for (const propAccess of propAccesses) {
        const callee = propAccess.getExpression();
        const calleeText = callee.getText();
        
        // If the callee is one of our risky identifiers
        if (riskyIdentifiers.includes(calleeText) && !propAccess.hasQuestionDotToken()) {
            // Check if it's safe to add ?. (not on left side of assignment)
            const parent = propAccess.getParent();
            if (parent && parent.isKind(SyntaxKind.BinaryExpression)) {
                const operator = parent.getOperatorToken().getText();
                if (operator === '=' && parent.getLeft() === propAccess) {
                    continue; // Skip assignment
                }
            }
            
            // Just replace with ?.
            propAccess.replaceWithText(`${calleeText}?.${propAccess.getName()}`);
            fileModified = true;
            modifications++;
        }
    }

    if (fileModified) {
        sourceFile.saveSync();
    }
});

console.log(`Successfully applied ${modifications} defensive null-checks across the codebase.`);
