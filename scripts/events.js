(()=>{
    global.EVENTS = Object.fromEntries(eventsInfo.map(o => [
        o.id.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase()), o.id
    ]));
});