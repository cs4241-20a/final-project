import { debug } from 'webpack';

const debugMode = false

const {VM, VMScript} = require('vm2');
const vm = new VM();

/**
 * Runs untrusted code in a safe execution environment
 * and returns true if the code runs successfully without throwing any errors.
 * @param {Array} : [solution,challengeTests]
 */
export async function testCodeCompletesWithoutError(argArray) {

    const solution = argArray[0]
    const challengeTests = argArray[1]

    console.log("\n In Sandbox")
    console.log(`solution: \n ${solution}\n`)
    console.log(`challengeTests: \n ${challengeTests}\n`)

    let solutionScript
    let testScript

    try {
        solutionScript = new VMScript(solution).compile()
        testScript = new VMScript(challengeTests).compile()
    } catch (err) {
        if (debug)
            console.error('Failed to compile script.', err);
        else
            console.error('Failed to compile script.');

        return false
    }

    try {
        vm.run(solutionScript) // set solution function in vm
    } catch (err) {
        if (debug)
            console.error('Failed to execute script.', err);
        else
            console.error('Failed to execute script.');
        
        return false
    }

    try {
        vm.run(testScript)
    } catch (err) {
        console.error('Failed to test the solution script.', err);
        return false
    }

    return true;
} 