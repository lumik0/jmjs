(()=>{
    global.getCond = (action, values)=>{
        let id, o;
        const _not = typeof values[0] == 'boolean' ? values[0] : null;
        if(_not) values = values.slice(1);
        
        if(typeof action == 'string'){
            id = action;
            id = id.replace(/var_|player_|entity_/g, match => ({ var_: 'if_variable_', player_: 'if_player_', entity_: 'if_entity_' })[match]);
            o = actionsInfo.find(e => e.type == 'container' && e.id == id);
            if(!o) return false;
        } else {
            if(typeof action == 'object' && !Array.isArray(action) && action.type == 'variable'){
                const list = {
                    '==': 'var_equals',
                    '<': 'var_greater',
                    '>': 'var_less',
                    '<=': 'var_greater_or_equals',
                    '>=': 'var_less_or_equals'
                }
                if(list[values[0]]){
                    const variable = action;
                    action = list[values[0]];
                    id = list[values[0]].replace(/var_|player_|entity_/g, match => ({ var_: 'if_variable_', player_: 'if_player_', entity_: 'if_entity_' })[match]);
                    values[0] = variable;
                    o = actionsInfo.find(e => e.type == 'container' && e.id == id);
                    if(!o) return false;
                } else return false;
            } else return false;
        }

        values = values.map(getValue);
        if(o.args) for(let i=0;i<o.args.length;i++){
            let arg = o.args[i];
            if(!values[i]) continue;
            if(arg.type == 'enum'){
                if(arg.values.includes(values[i].text)){
                    values[i] = {
                        name: arg.id,
                        value: {
                            type: 'enum',
                            enum: values[i]
                        }
                    }
                }
            }else{
                values[i] = {
                    name: arg.id,
                    value: values[i]
                }
            }
        }
        return {
            action: id, values,
            isInverted: _not??undefined,
        }
    }

    function condition(type, ...values){
        const old = cOperation;
        const cond = getCond(type, values);
        if(cond){
            addOperation({
                action: cond.action,
                values: cond.values,
                is_inverted: cond.isInverted,
                operations: []
            });
        } else error(`Нет такого типа условия: ${type}`);
    
        let cIF = cOperation[cOperation.length-1].operations;
        cOperation = old;
        return {
            then(callback){
                cOperation = cIF;
                callback();
                cOperation = old;
                return this;
            },
            elseif(...v){
                return condition(...v);
            },
            elif(...v){
                return condition(...v);
            },
            else(callback){
                addOperation({
                    action: 'else',
                    values: [],
                    operations: []
                });
                cOperation = cOperation[cOperation.length-1].operations;
                callback();
                cOperation = old;
                return this;
            }
        }
    }

    return { condition, cond: condition };
});