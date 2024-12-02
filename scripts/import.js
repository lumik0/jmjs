(()=>{
    function impоrt(s){
        cScript = {
            path: __dirname+s,
            data: fs.readFileSync(__dirname+s, {encoding: 'utf8'}),
        };
        try{
            eval(cScript.data);
        }catch(e){
            error(e);
        }
    }

    return {
        impоrt,
        import_: impоrt,
        _import: impоrt,
        Import: impоrt,
        IMPORT: impоrt,
        imp: impоrt
    };
});