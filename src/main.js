class YandexMapsRoute {
  constructor() {
    this.ymaps;
    this.map;
  }
  init() {
    this.loadApi('https://api-maps.yandex.ru/2.1/?lang=ru_RU').then(() => {
      this.mount();
    });
  }

  loadApi(url) {
    if (Array.isArray(url)) {
      let self = this;
      let prom = [];
      url.forEach(function (item) {
        prom.push(self.script(item));
      });
      return Promise.all(prom);
    }

    return new Promise(function (resolve, reject) {
      let r = false;
      let t = document.getElementsByTagName('script')[0];
      let s = document.createElement('script');

      s.type = 'text/javascript';
      s.src = url;
      s.async = true;
      s.onload = s.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState === 'complete')) {
          r = true;
          resolve(this);
        }
      };
      s.onerror = s.onabort = reject;
      t.parentNode.insertBefore(s, t);
    });
  }
  mount() {
    this.ymaps = global.ymaps;
    this.map;
    this.ymaps.ready(() => {
      this.multiRouteModel = new ymaps.multiRouter.MultiRouteModel([], {
        avoidTrafficJams: true,
        reverseGeocoding: true
      });
      this.multiRouteView = new ymaps.multiRouter.MultiRoute(this.multiRouteModel, {

      });
      this.map = new ymaps.Map('map', {
        center: [59.939095, 30.315868],
        zoom: 10,
        controls: [this.buildEditButton()]
      }, {
        buttonMaxWidth: 300
      });
      this.map.geoObjects.add(this.multiRouteView);
      this.multiRouteView.model.events
        .add("requestsuccess", (event) => {
          let target = [];
          let points = event.get("target").getJson();
          points.properties.waypoints.forEach((items) => {
            target.push(items.address);
          });
          console.log(target)
          document.querySelector('#console').innerHTML = target.join('</br>');
        })
        .add("requestfail", function (event) {
          console.log("Ошибка: " + event.get("error").message);
        });
    });
  }
  buildEditButton() {
    let buttonEditor = new ymaps.control.Button({
      data: {
        content: "Режим редактирования"
      }
    });
    buttonEditor.events.add("select", () => {
      this.multiRouteView.editor.start({
        addWayPoints: true,
        removeWayPoints: true,
        drawOver: false
      });
    });
    buttonEditor.events.add("deselect", () => {
      this.multiRouteView.editor.stop();
    });
    return buttonEditor;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new YandexMapsRoute().init()
});