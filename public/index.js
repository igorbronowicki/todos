var app = {
    Model: {},
    Collection: {},
    View: {},
    Router: {}
};

var ENTER_KEY = 13;


/**
 * Модель данных для одного {todo}
 * ----------
 * Список атрибутов: "title", "order", и "completed".
 */

app.Model.Todo = Backbone.Model.extend({

    // По умолчанию каждый созданный экземпляр модели будет иметь атрибуты: "title", и "completed".
    defaults: {
        title: '',
        completed: false
    },

    // Функция смены логического состояния "completed".
    toggle: function() {
        this.save({
            completed: !this.get('completed')
        });
    }

});


/**
 * Коллекция {todo} экземпляров.
 * ----------
 * Для сохранения используется "localStorage" вместо удаленного сервера.
 */

app.Collection.TodoList = Backbone.Collection.extend({

    //
    model: app.Model.Todo,

    //
    localStorage: new Store('todos-backbone'),

    //
    completed: function() {
        return this.filter(function( todo ) {
            return todo.get('completed');
        });
    },

    //
    remaining: function() {
      return this.without.apply( this, this.completed() );
    },

    //
    nextOrder: function() {
      if ( !this.length ) {
        return 1;
      }
      return this.last().get('order') + 1;
    },

    // Один дядька говорил избегать этой хуйни.
    comparator: function( todo ) {
      return todo.get('order');
    }

});

//
app.Collection.todoList = new app.Collection.TodoList();


/**
 * ????????????
 * ----------
 * ??????????
 */

app.View.AppView = Backbone.View.extend({

    el: '#todoapp',

    // JS шаблон статистики
    statsTemplate: _.template($('#stats-template').html()),

    events: {
        'keypress #new-todo': 'createOnEnter',
        'click #clear-completed': 'clearCompleted',
        'click #toggle-all': 'toggleAllComplete'
    },

    //
    initialize: function() {
        this.input = this.$('#new-todo'); // Текстовое поле для ввода новых {TODO}
        this.allCheckbox = this.$('#toggle-all')[0]; // Флажок для пометки всех {TODO} как выполненных
        this.$footer = this.$('#footer');
        this.$main = this.$('#main');

        // Обработчики событий для коллекции {TODO}
        app.Collection.todoList.on('add', this.addOne, this);
        app.Collection.todoList.on('reset', this.addAll, this);
        app.Collection.todoList.on('all', this.render, this); // Статистика обновляется по каждому чиху
        app.Collection.todoList.on('change:completed', this.filterOne, this); // ??????
        app.Collection.todoList.on('filter', this.filterAll, this); // ?????????

        // Заполняем коллекцию данными
        app.Collection.todoList.fetch();
    },

    // В основном занимается обновлением статистики
    render: function() {
        var completed = app.Collection.todoList.completed().length; // Колличество выполненных {TODO}
        var remaining = app.Collection.todoList.remaining().length; // Колличество оставшихся к выполнению {TODO}

        if ( app.Collection.todoList.length ) { // Если коллекция {TODO} не пуста
            // Отображаем "main" & "footer"
            this.$main.show();
            this.$footer.show();

            // Обновляем информацию в "footer"
            this.$footer.html(this.statsTemplate({
                completed: completed,
                remaining: remaining
            }));

            // ?????????????
            this.$('#filters li a')
                .removeClass('selected')
                .filter('[href="#/' + ( app.TodoFilter || '' ) + '"]')
                .addClass('selected');
        } else { // Скрываем "main" & "footer"
            this.$main.hide();
            this.$footer.hide();
        }

        // ?????????????
        this.allCheckbox.checked = !remaining;
    },

    // Рисуем один элемент списка и добавляем его в список. Передаем экземпляр модели {Todo}
    addOne: function(todo) {
        var vi = new app.View.TodoItem({model: todo});
        $('#todo-list').append(vi.render().el);
    },

    // Используя цикл добавляем все элементы из коллекции {TodoList} в список
    addAll: function() {
        this.$('#todo-list').html('');
        app.Collection.todoList.each(this.addOne, this);
    },

    // ????????????
    filterOne: function(todo) {
        todo.trigger("visible");
    },

    // ????????????
    filterAll: function() {
        app.Collection.todoList.each(this.filterOne, this);
    },

    //
    newAttributes: function() {
        return {
            title: this.input.val().trim(),
            order: app.Collection.todoList.nextOrder(),
            completed: false
        };
    },

    // Обработчик события нажатия клавиш в поле ввода новой {TODO}
    createOnEnter: function(e) {
        // Если не была нажата {ENTER_KEY} или поле пустое, ничего не делаем
        if (e.which !== ENTER_KEY || !this.input.val().trim()) {
            return;
        }

        // Создадим экз. модели, добавим в коллекцию и очистим поле ввода для дальнейшего ввода
        app.Collection.todoList.create(this.newAttributes());
        this.input.val('');
    },

    // Для каждого экз. модели вызываем метод "destroy"
    clearCompleted: function() {
        _.each(app.Collection.todoList.completed(), function(todo) {
            todo.destroy();
        });

        return false;
    },

    // 
    toggleAllComplete: function() {
        // Состояние флажка (true, false)
        var completed = this.allCheckbox.checked;

        // Обновим свойство "completed" каждого экз. модели
        app.Collection.todoList.each(function(todo) {
            todo.save({
                'completed': completed
            });
        });
    }

});


/**
 * ????????????
 * ----------
 * ??????????
 */

app.View.TodoItem = Backbone.View.extend({

    tagName:  'li',

    // JS шаблон одного {TODO}
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
        'dblclick label': 'edit', // Двойной клик по {label} бросает нас в режим редактирования
        'keypress .edit': 'updateOnEnter', // Каждый раз когда мы что-то набираем на клавиатуре
        'blur .edit': 'close' // Элемент ввода теряет фокус
    },

    initialize: function() {
        this.model.on('change', this.render, this); // Будем слушать события изменения переданного экземпляра модели
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit'); // ?????????
        return this;
    },

    // Переводим этот View в "editing" режим
    edit: function() {
        this.$el.addClass('editing');
        this.input.focus();
    },

    // Выходим из "editing" режима, сохраняем данные
    close: function() {
        var value = this.input.val().trim(); // Данные из поля

        if (value) {
            this.model.save({title: value }); // Сохраняем данные
        }

        this.$el.removeClass('editing'); // Покидаем режим "editing"
    },

    // Если пользователь нажал {ENTER_KEY}, выходим из режима редактирования
    updateOnEnter: function(e) {
        if (e.which === ENTER_KEY) {
            this.close();
        }
    }

});


$(function(){
    console.log("Hello World!");
    new app.View.AppView();
});