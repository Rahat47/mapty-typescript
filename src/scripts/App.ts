import L, { Icon, LeafletMouseEvent, Marker } from 'leaflet';
import Cycling from './Cycling';
import Running from './Running';
import Workout from './Workout';
import '../icon.png';

// fix leaflet marker icon not showing up
const icon = L.icon({
  iconUrl: '../icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

class App {
  private map: L.Map;
  private mapEvent: LeafletMouseEvent | null;
  public form: HTMLFormElement;
  public inputDistance: HTMLInputElement;
  public containerWorkouts: HTMLUListElement;
  public inputType: HTMLSelectElement;
  public inputDuration: HTMLInputElement;
  public inputCadence: HTMLInputElement;
  public inputElevation: HTMLInputElement;
  private workouts: Workout[] = [];

  constructor() {
    this._loadMap = this._loadMap.bind(this);
    this._newWorkout = this._newWorkout.bind(this);
    this._showForm = this._showForm.bind(this);
    this._moveToPopup = this._moveToPopup.bind(this);

    // get the DOM elements
    this.form = document.querySelector<HTMLFormElement>('.form')!;
    this.inputDistance = document.querySelector<HTMLInputElement>(
      '.form__input--distance'
    )!;
    this.inputType =
      document.querySelector<HTMLSelectElement>('.form__input--type')!;
    this.containerWorkouts =
      document.querySelector<HTMLUListElement>('.workouts')!;
    this.inputDuration = document.querySelector<HTMLInputElement>(
      '.form__input--duration'
    )!;
    this.inputElevation = document.querySelector<HTMLInputElement>(
      '.form__input--elevation'
    )!;
    this.inputCadence = document.querySelector<HTMLInputElement>(
      '.form__input--cadence'
    )!;

    // initialize the map
    this.map = L.map('map').setView([0, 0], 13);
    this.mapEvent = null;

    // add event listeners
    this.form.addEventListener('submit', this._newWorkout);
    this.containerWorkouts.addEventListener('click', this._moveToPopup);

    // get the geolocation position
    this._getPosition();

    // get items from localstorage
    this._getLocalStorage();
  }

  _getLocalStorage() {
    const rawData = localStorage.getItem('workouts');

    const data = rawData ? JSON.parse(rawData) : [];

    if (!data) return;

    const _workouts = data as Workout[];

    _workouts.forEach(workout => {
      if (workout.type === 'running') {
        const _work = workout as Running;

        const work = new Running(
          _work.coords,
          _work.distance,
          _work.duration,
          _work.cedance
        );
        this.workouts.push(work);
      }

      if (workout.type === 'cycling') {
        const _work = workout as Cycling;
        const work = new Cycling(
          _work.coords,
          _work.distance,
          _work.duration,
          _work.elevationGain
        );
        this.workouts.push(work);
      }
    });
  }

  // gets the geolocation position and renders the map
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap, e => {
        console.log(e);
        alert('Unable to get your location');
      });
    }
  }

  _loadMap(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;

    const coords: [number, number] = [latitude, longitude];

    this.map.setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    L.marker([latitude, longitude])
      .addTo(this.map)
      .bindPopup('You are here')
      .openPopup();

    this.map.on('click', this._showForm);

    this.workouts.forEach(work => {
      if (work instanceof Running || work instanceof Cycling) {
        this._renderWorkoutMaker(work);
        this._renderWorkout(work);
      }
    });
  }

  _showForm(e: LeafletMouseEvent) {
    this.mapEvent = e;
    this.form.classList.remove('hidden');
    this.inputDistance.focus();

    this.inputType.addEventListener('change', this._toggleElevetaionField);
  }

  _hideForm() {
    this.inputCadence.value =
      this.inputDistance.value =
      this.inputDuration.value =
      this.inputElevation.value =
        '';
    this.form.style.display = 'none';
    this.form.classList.add('hidden');
    setTimeout(() => {
      this.form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevetaionField() {
    this.inputElevation = document.querySelector<HTMLInputElement>(
      '.form__input--elevation'
    )!;

    this.inputCadence = document.querySelector<HTMLInputElement>(
      '.form__input--cadence'
    )!;

    this.inputElevation
      .closest('.form__row')!
      .classList.toggle('form__row--hidden');
    this.inputCadence
      .closest('.form__row')!
      .classList.toggle('form__row--hidden');
  }

  _newWorkout(e: SubmitEvent) {
    const validInputs = (...inputs: string[]) => {
      const result = inputs.every(input => Number.isFinite(Number(input)));
      return result;
    };

    const allPositive = (...inputs: string[]) => {
      const result = inputs.every(input => Number(input) >= 0);
      return result;
    };

    e.preventDefault();

    // get data from the form
    const type = this.inputType.value;
    const distance = this.inputDistance.value;
    const duration = this.inputDuration.value;
    const { lat, lng } = this.mapEvent!.latlng;
    let workout: Running | Cycling;

    // if activity is cycling, create a cycling object
    // check if data is valid

    if (type === 'cycling') {
      const elevation = this.inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        alert('Please enter a valid positive number');
        return;
      }

      workout = new Cycling(
        [lat, lng],
        Number(distance),
        Number(duration),
        Number(elevation)
      );
    }
    // if activity is running, create a running object
    else if (type === 'running') {
      // check if data is valid

      const cedance = this.inputCadence.value;
      if (
        !validInputs(distance, duration, cedance) ||
        !allPositive(distance, duration, cedance)
      ) {
        alert('Please enter a valid positive number');
        return;
      }

      workout = new Running(
        [lat, lng],
        Number(distance),
        Number(duration),
        Number(cedance)
      );
    }

    // add the workout to the list of workouts

    this.workouts.push(workout!);

    // render workout on map as marker
    this._renderWorkoutMaker(workout!);

    // render workout on list
    this._renderWorkout(workout!);

    // hide the form
    this._hideForm();

    // set local storage to all workouts
    this._setLocalStorage();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.workouts));
  }

  _renderWorkoutMaker(workout: Running | Cycling) {
    const description = `${workout instanceof Running ? '🏃‍♂️' : '🚴‍♀️'} ${
      workout.description
    }`;

    L.marker(workout.coords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          autoClose: false,
          maxWidth: 250,
          minWidth: 100,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(description)
      .openPopup();
  }

  _renderWorkout(workout: Running | Cycling) {
    let html: string;

    if (workout instanceof Running) {
      html = `
    <li class="workout workout--running" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>

    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cedance}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>

    `;
    }

    if (workout instanceof Cycling) {
      html = `
      <li class="workout workout--cycling" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">🚴‍♀️</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
    }

    this.form.insertAdjacentHTML('afterend', html!);
  }

  _moveToPopup(e: MouseEvent) {
    const target = e.target as HTMLUListElement;
    const workoutEl = target.closest('.workout') as HTMLLIElement;

    if (!workoutEl) {
      return;
    }

    const workout = this.workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    if (!workout) {
      return;
    }

    this.map.setView(workout.coords, 14, {
      animate: true,
      duration: 1,
    });

    workout.click();
  }

  reset() {
    localStorage.removeItem('workouts');
    window.location.reload();
  }
}

export default App;
