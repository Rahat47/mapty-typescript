import Workout from './Workout';

class Cycling extends Workout {
  speed: number = 0;
  constructor(
    coords: [number, number],
    distance: number,
    duration: number,
    public elevationGain: number
  ) {
    super(coords, distance, duration, 'cycling');
    this.elevationGain = elevationGain;

    this.calcSpeed();
  }

  calcSpeed() {
    // km per hour
    const speed = this.distance / (this.duration / 60);
    this.speed = speed;
    return speed;
  }
}

export default Cycling;
