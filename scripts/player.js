((selector)=>{
    const selectorO = selector?{type: selector}:undefined;
    const sel = (selector||'player').replace('_player', '');
    
    const methods = {};
    const arr = actionsInfo.filter(e => e.object == 'player' && e.type == 'basic');
    arr.forEach(obj => {
        const id = obj.id.replace('player_','');
        methods[id.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase())] = (...args) => {
            let _args = args;
            args = obj.args.map((arg, i) => {
                let value = _args[i];
                
                if(arg.array){
                    let arr = [];
                    value = Array.isArray(value) ? value : _args;
                    for(let j=0;j<value.length;j++){
                        if(typeContains(arg.type, getValue(value[j]).type)){
                            arr.push(getValue(value[j]));
                        }
                    }
                    _args = _args.filter((_,i) => arr[i] === undefined);
                    return { name: arg.id, value: getValue(arr)};
                } else if(arg && value){
                    if(obj.args[i+1] && obj.args[i+1].array)
                        _args.splice(i, 1);
                    if(arg.type == 'enum') return { name: arg.id, value: {type: 'enum', enum: typeof value=='boolean'?(!!value).toString().toUpperCase():value }};
                    return { name: arg.id, value: getValue(value) };
                }
            }).filter(Boolean);

            addO(obj.id, args, {selection: selectorO});
        }
    });

    return {
        jmjs: true,
        type: 'player',
        name: `%${sel}%`,
        username: `%${sel}%`,
        uuid: `%${sel}_uuid%`,
        message: methods.sendMessage,
        ...methods
    }
});