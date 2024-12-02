((code)=>{
    funs = {};

    let lastFunc = null;
    let callFunction = (name,...args)=>{
        lastFunc = name;
        funs[name](...args);
    };
    let callF = global.callFunction;
    let addHandler = ()=>{};
    let addOperation = ()=>{};
    let addO = ()=>{};

    try{
        eval(code);
    }catch(e){
        if(e.message.includes('Maximum call stack size exceeded')){
            error(e, `Достигнут предел рекурсии, функция '${lastFunc}' вызвана более 10000 раз`);
        }
    }
});