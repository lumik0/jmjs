    // Переменные
game.a = 1; // определение игровой переменной
save.a = 1; // определение сохраненной переменной
local.a = 1; // определение локальной переменной

    // События
events.on(EVENTS.playerJoin, (e)=>{ // Событие игрока: Вход
    e.player.message("Привет!"); // Отправлять сообщение игроку с текстом "Привет!"
});
events.on(EVENTS.playerChat, (e)=>{ // Событие игрока: Сообщение
    e.player.message(["Вы отправили сообщение:",gameValue("event_chat_mssaage")]); // gameValue - игровое значение
});

    // Команды
// commands['команда'] = ...;
// cmd['команда'] = ...;
commands['@test'] = (a, b, c) => { // Команда: @test с аргументами a, b и c
    // event может быть использован в любом месте, где он доступен
    event.player.message(`a: ${a}, b: ${b}, c: ${c}`); // Отправлять сообщение игроку аргументы в виде текста
}

    // Условия
//condition(условие).then(...).else(...).elseif(...).elif(...);
condition('if_variable_equals', save['a'], 1).then(_=>{ // Если сохраненная переменная 'a' равна 1
    event.player.message(`Переменная равна 1!`);
// var_equals - сокращение условия(if_variable_equals)
}).elseif('var_equals', save['a'], 2).then(_=>{ // Иначе если сохраненная переменная 'a' равна 2
    event.player.message(`Переменная 'a' не равна 1, но равна 2`);
// Вы также можете использовать также:
}).elseif(save['a'], '==', 3).then(_=>{ // Иначе если сохраненная переменная 'a' равна 3
    event.player.message(`Переменная 'a' равна 3`);
}).else(_=>{ // Иначе
    event.player.message(`Переменная 'a' не равна 1 и не равна 2`);
});

    // Циклы
// onRange(переменная, начало, конец, шаг, обработчик);
// range(переменная, начало, конец, шаг, обработчик)
range(local.i, 0, 10, 1, i=>{
    event.player.message('index: '+i);
});

whilе(условие).do(_ => {
    // ...code
});
// Обратите внимание, что у whilе русская буква "е". Если бы это была английская "e", то возникла бы ошибка
/*
while_(...)
_while(...)
whilee(...)
wwhile(...)
While(...)
WHILE(...)
*/
dо(_=>{
    // ...code
}).while(условие)
/*
Do(...)
до(...)
do_(...)
_do(...)
*/

//forever - повторять вечно
forever(_=>{
    //...code
});

    // Ждать
wait(5) // ждать 5 тиков
wait(5, "SECONDS") // ждать 5 секунд
wait(_=>{
    //...code
}, 5, "MINUTES");

    // Функции и процессы
functions.test = (a, b, c)=>{ // Функция test с аргументами a, b и c
    event.player.message(`Hi, ${a} ${b} ${c}`);
}
// funs - сокращение functions
funs['странное название 😈'] = ()=>{ // Функция без аргументов
    event.player.message(`Привет!`);
}
callFunction("test", 2,4,3);
callF(funs.test, 2,4,3);

processes.test = (a, b, c)=>{
    current.message(`Hi, ${a} ${b} ${c}`);
}
startProcess('test', "DONT_COPY", "CURRENT_TARGET", 2,4,3);

    // Фабрики
// x, y, z, [yaw, pitch]
location(1,2,3,4,5)
loc(1,2,3)

// id, name, count, lore, nbt, custom_tags
item("diamond_sword");
item({id: 'diamond', lore: 'Описание предмета'});

// id
block('stone');

minimessage(text)
mm(text)

    // Импорт
impоrt('script.js'); // буква "о" русская
/*
import_(...)
_import(...)
Import(...)
IMPORT(...)
imp(...)
*/