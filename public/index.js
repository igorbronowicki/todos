var app = {
    Model: {},
    Collection: {},
    View: {},
    Router: {}
};


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










$(function(){
    console.log("Hello World!");
});