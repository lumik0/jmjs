(()=>{
    function placeholder(value){
        const id = Math.random().toString(36);

        const pvalue = getValue(value);
        if(typeof pvalue == 'object'){
            if(pvalue.type == 'variable'){
                return `%var(${pvalue.variable})`;
            }
        }
        game[`JMJS_placeholders:${id}`] = getValue(value);
        return `%var(JMJS_placeholders:${id})`;
    }

    return { placeholder, ph: placeholder }
});