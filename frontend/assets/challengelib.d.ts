// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/console.d.ts
declare module "console" {
    global {
        // This needs to be global to avoid TS2403 in case lib.dom.d.ts is present in the same build
        interface Console {
            /**
             * A simple assertion test that verifies whether `value` is truthy.
             * If it is not, an `AssertionError` is thrown.
             * If provided, the error `message` is formatted using `util.format()` and used as the error message.
             */
            assert(value: any, message?: string, ...optionalParams: any[]): void;
        }

        var console: Console;
    }
}