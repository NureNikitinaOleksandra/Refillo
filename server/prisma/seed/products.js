export const categories = [
  "Кава та Чай",
  "Побутова хімія",
  "Особиста гігієна",
  "Снеки та солодощі",
  "Напої",
  "Товари для тварин",
  "Бакалія",
  "Молочні продукти",
];

export const products = [
  // Кава та Чай
  {
    category: "Кава та Чай",
    name: "Кава в зернах Arabica 1кг",
    desc: "100% арабіка, середнє обсмаження.",
    price: 450,
    stock: 100,
    img: "coffee-beans.png",
  },
  {
    category: "Кава та Чай",
    name: "Кава мелена Espresso 250г",
    desc: "Ідеально для ранкового еспресо.",
    price: 180,
    stock: 150,
    img: "coffee-ground.png",
  },
  {
    category: "Кава та Чай",
    name: "Чай зелений Jasmine 500г",
    desc: "Крупнолистовий зелений чай з жасмином.",
    price: 320,
    stock: 50,
    img: "green-tea.png",
  },
  {
    category: "Кава та Чай",
    name: "Чай чорний Earl Grey 100г",
    desc: "Класичний чорний чай з бергамотом.",
    price: 120,
    stock: 80,
    img: "black-tea.png",
  },

  // Побутова хімія
  {
    category: "Побутова хімія",
    name: "Капсули для прання Tide (30 шт)",
    desc: "Універсальні капсули для прання.",
    price: 380,
    stock: 200,
    img: "tide-pods.png",
  },
  {
    category: "Побутова хімія",
    name: "Паперові рушники Selpak (2 шт)",
    desc: "Тришарові рушники, відмінно вбирають вологу.",
    price: 85,
    stock: 300,
    img: "paper-towels.png",
  },
  {
    category: "Побутова хімія",
    name: "Засіб для миття посуду Fairy 1л",
    desc: "Ефективно видаляє жир навіть у холодній воді.",
    price: 120,
    stock: 150,
    img: "fairy.png",
  },
  {
    category: "Побутова хімія",
    name: "Пакети для сміття 35л (30 шт)",
    desc: "Міцні пакети із затяжками.",
    price: 55,
    stock: 400,
    img: "trash-bags.png",
  },

  // Особиста гігієна
  {
    category: "Особиста гігієна",
    name: "Туалетний папір Zewa Deluxe (8 шт)",
    desc: "Тришаровий папір з ароматом персика.",
    price: 150,
    stock: 400,
    img: "zewa.png",
  },
  {
    category: "Особиста гігієна",
    name: "Гель для душу Palmolive 500мл",
    desc: "Зволожуючий гель з екстрактом оливи.",
    price: 130,
    stock: 150,
    img: "shower-gel.png",
  },
  {
    category: "Особиста гігієна",
    name: "Мило рідке Dove 250мл",
    desc: "Крем-мило для рук.",
    price: 75,
    stock: 200,
    img: "soap.png",
  },
  {
    category: "Особиста гігієна",
    name: "Зубна паста Sensodyne 75мл",
    desc: "Для чутливих зубів.",
    price: 110,
    stock: 120,
    img: "toothpaste.png",
  },

  // Товари для тварин
  {
    category: "Товари для тварин",
    name: "Корм для котів Purina 1.5кг",
    desc: "Сухий корм для стерилізованих котів.",
    price: 290,
    stock: 40,
    img: "cat-food.png",
  },
  {
    category: "Товари для тварин",
    name: "Наповнювач деревний 5кг",
    desc: "Екологічний наповнювач для лотка.",
    price: 110,
    stock: 90,
    img: "cat-litter.png",
  },
  {
    category: "Товари для тварин",
    name: "Вологий корм для собак Pedigree 100г",
    desc: "Шматочки яловичини в соусі.",
    price: 25,
    stock: 150,
    img: "dog-food.png",
  },

  // Молочні продукти та Бакалія
  {
    category: "Молочні продукти",
    name: "Молоко Яготинське 3.2% 900г",
    desc: "Пастеризоване коров'яче молоко.",
    price: 42,
    stock: 100,
    img: "milk.png",
  },
  {
    category: "Молочні продукти",
    name: "Масло вершкове Ферма 73% 200г",
    desc: "Солодковершкове масло.",
    price: 80,
    stock: 80,
    img: "butter.png",
  },
  {
    category: "Бакалія",
    name: "Яйця курячі Ясенсвіт (10 шт)",
    desc: "Добірні свіжі курячі яйця.",
    price: 65,
    stock: 120,
    img: "eggs.png",
  },
  {
    category: "Бакалія",
    name: "Оливкова олія Extra Virgin 500мл",
    desc: "Холодного віджиму.",
    price: 340,
    stock: 30,
    img: "olive-oil.png",
  },

  // Снеки та Напої
  {
    category: "Снеки та солодощі",
    name: "Шоколад Milka Milk 90г",
    desc: "Молочний шоколад з альпійським молоком.",
    price: 45,
    stock: 300,
    img: "milka.png",
  },
  {
    category: "Напої",
    name: "Мінеральна вода Моршинська 1.5л",
    desc: "Негазована мінеральна вода.",
    price: 25,
    stock: 500,
    img: "water.png",
  },

  // --- ТОВАРИ ДЛЯ ТЕСТУВАННЯ ЗАЛИШКІВ ---

  // Товар повністю розпроданий (stock: 0) - для тестування недоступності
  {
    category: "Особиста гігієна",
    name: "Електрична зубна щітка Oral-B",
    desc: "Професійне очищення.",
    price: 850,
    stock: 0,
    img: "oral-b.png",
  },

  // Товар, якого залишилося критично мало (stock: 2) - для тестування лімітів кошика
  {
    category: "Снеки та солодощі",
    name: "Печиво Oreo 154г",
    desc: "Класичне печиво з какао та ванільною начинкою.",
    price: 55,
    stock: 2,
    img: "oreo.png",
  },
];
