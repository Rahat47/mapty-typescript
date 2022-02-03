class Workout {
  date: Date = new Date();
  id: string = (new Date().getTime() + '').slice(-10);
  description: string = '';
  clicks: number = 0;
  constructor(
    public coords: [number, number],
    public distance: number,
    public duration: number,
    public type: string
  ) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.type = type;

    this._setDescription();
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks += 1;
  }
}

export default Workout;
