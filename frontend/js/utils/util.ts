export function handleChange(handler: (v: any) => void) {
    return (e: any) => handler(e.target.value)
}

export function handleChangeWithValue(handler: (v: any) => void) {
    return (e: any, v: any) => handler(v)
}