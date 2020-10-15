import { debug } from 'webpack';

const debugMode = false

const {VM, VMScript} = require('vm2');
const vm = new VM();

const assertMethod = `
    function assert(booleanExpression, errorMessage){

        message = "Assertion Failed! "

        if (errorMessage && typeof errorMessage === "string"){ // error message set up
            message = message.concat("Error Message: ", errorMessage)
        }

        if (!booleanExpression) {
            throw message
        }
    }


`

/**
 * Runs untrusted code in a safe execution environment
 * and returns true if the code runs successfully without throwing any errors.
 * @param {Array} : [solution,challengeTests]
 * @returns {Array} 
 *      [0]: boolean, indicates test success or fail
 *      [1]: Error Type
 *      [2]: Error message
 */
export async function testCodeCompletesWithoutError(argArray) {

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

    answer = [true, "NO ERROR", "NO ERROR MESSAGE"]
    return answer;
} 