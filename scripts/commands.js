(()=>{
    const commands = new Proxy({}, {
        set(target, property, value) {
            addHandler({
                type: 'event',
                event: 'player_chat',
                operations: []
            });
            event.cancel();
            
            target[property] = value;
            const args = getFArgs(value);
            vars.commands[property] = {
                func: value,
                args: args,
                handler: cHandler,
                operation: cOperation
            }

            condition('var_text_starts_with', gv('event_chat_message'), property).then((e)=>{
                variable.splitText(local[`JMJS_${property}`], gv('event_chat_message'), ' ');
                
                const vargs = args.map((_, i) => {
                    variable.getListValue(local[`JMJS_${property}_args:${i}`], local[`JMJS_${property}`], i+1);
                    return `%var_local(JMJS_${property}_args:${i})`;
                });
                vars.commands[property].func(...vargs);
            });
        }
    });

    return { commands, cmd: commands }
});