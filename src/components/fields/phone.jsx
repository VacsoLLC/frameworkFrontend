export function read({value}){
    if(!value) return value;
    return <a href={`tel:${value}`} onKeyDown={e => e.preventDefault()}>{value}</a>;
}