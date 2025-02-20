
export default class Storage {
    constructor(key) {
        this.key = key || 'points';
    }

    loadPoints() {
        const data = localStorage.getItem(this.key);

        if (!data) {
            return [];
        }

        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse points:', e);
            return [];
        }
    }

    savePoints(points) {
        try {
            localStorage.setItem(this.key, JSON.stringify(points));
        } catch (e) {
            console.error('Failed to save points:', e);
        }
    }
}
