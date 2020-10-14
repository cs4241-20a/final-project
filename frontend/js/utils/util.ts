export function handleChange(handler: (v: any) => void) {
    return (e: any) => handler(e.target.value)
}