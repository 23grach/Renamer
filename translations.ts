interface Translations {
    [key: string]: {
        ru: string;
        en: string;
    };
}

export const translations: Translations = {
    // UI Elements
    button: {
        ru: "Кнопка",
        en: "Button"
    },
    form: {
        ru: "Форма",
        en: "Form"
    },
    card: {
        ru: "Карточка",
        en: "Card"
    },
    container: {
        ru: "Контейнер",
        en: "Container"
    },
    header: {
        ru: "Шапка",
        en: "Header"
    },
    footer: {
        ru: "Подвал",
        en: "Footer"
    },
    sidebar: {
        ru: "Боковая панель",
        en: "Sidebar"
    },
    modal: {
        ru: "Модальное окно",
        en: "Modal"
    },
    dropdown: {
        ru: "Выпадающий список",
        en: "Dropdown"
    },
    tooltip: {
        ru: "Подсказка",
        en: "Tooltip"
    },
    badge: {
        ru: "Бейдж",
        en: "Badge"
    },
    avatar: {
        ru: "Аватар",
        en: "Avatar"
    },

    // Text elements
    text: {
        ru: "Текст",
        en: "Text"
    },
    heading: {
        ru: "Заголовок",
        en: "Heading"
    },
    description: {
        ru: "Описание",
        en: "Description"
    },

    // Container descriptions
    withElements: {
        ru: "с {count} элементами",
        en: "with {count} elements"
    },
    withFields: {
        ru: "с {count} полями",
        en: "with {count} fields"
    },
    withButtons: {
        ru: "с {count} кнопками",
        en: "with {count} buttons"
    },
    withCards: {
        ru: "с {count} карточками",
        en: "with {count} cards"
    }
}; 