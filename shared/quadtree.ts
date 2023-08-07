import { IPoint } from "./interfaces/IPoint.ts";

export class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
  contains(x: number, y: number) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  intersects(range: Rectangle) {
    return !(
      range.x > this.x + this.width ||
      range.x + range.width < this.x ||
      range.y > this.y + this.height ||
      range.y + range.height < this.y
    );
  }
}

export class QuadTree<T = {}> {
  private points: Map<string, IPoint & T> = new Map();

  public nodes: QuadTree<T>[] = [];

  constructor(
    public boundary: Rectangle,
    public readonly capacity: number = 1,
    public depth = 0
  ) {}

  divide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    this.nodes.push(
      new QuadTree<T>(
        new Rectangle(x + w, y, w, h),
        this.capacity,
        this.depth + 1
      ),
      new QuadTree<T>(new Rectangle(x, y, w, h), this.capacity, this.depth + 1),
      new QuadTree<T>(
        new Rectangle(x, y + h, w, h),
        this.capacity,
        this.depth + 1
      ),
      new QuadTree<T>(
        new Rectangle(x + w, y + h, w, h),
        this.capacity,
        this.depth + 1
      )
    );
  }
  public insert(id: string, point: IPoint & T) {
    // insert the point in the quadtree or in one of its children

    if (!this.boundary.contains(point.x, point.y)) {
      return false;
    }

    if (this.points.size < this.capacity) {
      this.points.set(id, point);

      return true;
    }

    if (this.nodes.length === 0) {
      this.divide();
    }

    this.nodes.forEach((node) => {
      if (node.insert(id, point)) {
        return true;
      }
    });

    return false;
  }

  update() {
    // get all points, clear and reinsert them

    const points = this.getAllPoints();

    this.clear();

    points.forEach(([id, point]) => {
      this.insert(id, point);
    });

    return this;
  }

  query(range: Rectangle) {
    const points: Map<string, IPoint & T> = new Map();

    if (!this.boundary.intersects(range)) {
      return points;
    }

    this.points.forEach((point, id) => {
      if (range.contains(point.x, point.y)) {
        points.set(id, point);
      }
    });

    this.nodes.forEach((node) => {
      node.query(range).forEach((point, id) => {
        points.set(id, point);
      });
    });

    return points;
  }

  queryPoint(point: IPoint) {
    const points: Map<string, IPoint & T> = new Map();

    if (!this.boundary.contains(point.x, point.y)) {
      return points;
    }

    this.points.forEach((point, id) => {
      points.set(id, point);
    });

    this.nodes.forEach((node) => {
      node.queryPoint(point).forEach((point, id) => {
        points.set(id, point);
      });
    });

    return points;
  }
  queryRadius(point: IPoint, radius: number) {
    // return all points in the quadtree that are inside the radius

    const points: Map<string, IPoint & T> = new Map();

    if (!this.boundary.contains(point.x, point.y)) {
      return points;
    }

    this.points.forEach((point, id) => {
      if (Math.hypot(point.x - point.x, point.y - point.y) <= radius) {
        points.set(id, point);
      }
    });

    this.nodes.forEach((node) => {
      node.queryRadius(point, radius).forEach((point, id) => {
        points.set(id, point);
      });
    });

    return points;
  }

  //search for a point in the quadtree by id

  search(id: string): (IPoint & T) | null {
    if (this.points.has(id)) {
      return this.points.get(id) as IPoint & T;
    }

    if (this.nodes.length === 0) {
      return null;
    }

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const result = node.search(id);

      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  //remove a point from the quadtree by id

  remove(id: string) {
    if (this.points.has(id)) {
      this.points.delete(id);

      this.update();
      return true;
    }

    if (this.nodes.length === 0) {
      return false;
    }

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const result = node.remove(id);

      if (result) {
        this.update();

        return true;
      }
    }

    return false;
  }

  //clear the quadtree

  clear() {
    this.points.clear();

    this.nodes.forEach((node) => node.clear());

    this.nodes = [];
  }

  getAllPoints(): [string, IPoint & T][] {
    const points: [string, IPoint & T][] = [];

    // Adicionar os pontos do nó atual
    this.points.forEach((point, id) => {
      points.push([id, point]);
    });

    // Recursivamente obter os pontos dos nós filhos
    this.nodes.forEach((node) => {
      const childPoints = node.getAllPoints();
      childPoints.forEach(([id, point]) => {
        points.push([id, point]);
      });
    });

    return points;
  }

  //get all points in the quadtree

  get length() {
    let length = this.points.size;

    this.nodes.forEach((node) => {
      length += node.length;
    });

    return length;
  }

  get json() {
    return JSON.stringify(this);
  }
}
