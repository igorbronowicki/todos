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


$(function(){
    console.log("Hello World!");
});