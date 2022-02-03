import Workout from './Workout';

class Running extends Workout {
  pace: number = 0;
  constructor(
    coords: [number, number],
    distance: number,
    duration: number,
    public cedance: number
  ) {
    super(coords, distance, duration, 'running');
    this.cedance = cedance;

    this.calcPace();
  }

  calcPace() {
    // minutes per km
    const pace = this.duration / this.distance;
    this.pace = pace;
    return pace;
  }
}

export default Running;
