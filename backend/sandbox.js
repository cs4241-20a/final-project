import { debug } from 'webpack';

const debugMode = false;

const {VM, VMScript} = require('vm2');

const assertMethod = `
    function assert(booleanExpression, errorMessage){
        if (!booleanExpression) {
            const error = new Error(errorMessage);
            error.name = "AssertionError";
            throw error;
        }
    }
`

/**
 * Runs untrusted code in a safe execution environment
 * and returns true if the code runs successfully without throwing any errors.
 * @param {[solution: string, tests: string]} argArray
 * @returns {Promise<[success: boolean, errType: string, errMsg: Error]>} 
 *      [0]: boolean, indicates test success or fail
 *      [1]: Error Type
 *      [2]: Error message
 */
export async function testCodeCompletesWithoutError(argArray) {
    const vm = new VM({
        timeout: 1000,
        sandbox: {}
    });

    const solution = argArray[0]
    const challengeTests = argArray[1]
    let answer = [false, "", ""]

    console.log("\n In Sandbox")
    console.log(`solution: \n ${solution}\n`)
    console.log(`challengeTests: \n ${challengeTests}\n`)

    let solutionScript
    let testScript

    try { // Compile solution script
        solutionScript = new VMScript(solution).compile()
    } catch (err) {
        if (debugMode)
            console.error('Failed to compile solution script.', err);
        else
            console.error('Failed to compile solution script.');

        answer = [false, "Solution Compile Error", err]
        return answer
    }

    try { // Compile test script
        testScript = new VMScript(challengeTests).compile()
    } catch (err) {
        if (debugMode)
            console.error('Failed to compile test script.', err);
        else
            console.error('Failed to compile test script.');

        answer = [false, "Test Script Compile Error", err]
        return answer
    }

    try { // Set up assertion method
        vm.run(assertMethod)
    } catch (err) {
        if (debugMode)
            console.error('Failed to set up assert method.', err);
        else
            console.error('Failed to set up assert method.');

        answer = [false, "Assert Method Set Up Error", err]
        return answer
    }
    
    try { // Run the solution script
        vm.run(solutionScript) // set solution function in vm
    } catch (err) {
        if (debugMode)
            console.error('Failed to execute script.', err);
        else
            console.error('Failed to execute script.');
        
        answer = [false, "Solution Script Execution Error", err]
        return answer
    }

    try { // Run the test script
        vm.run(testScript)
    } catch (err) {
        if (debugMode)
            console.error('Failed to test the solution script.', err);
        else
            console.error('Failed to test the solution script.');

        answer = [false, "Test Failed", err]
        return answer
    }

    answer = [true, "NO ERROR", {}]
    return answer;
} 