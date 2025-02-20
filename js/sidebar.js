
export default class Sidebar {

    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onPointsChanged = () => {};
        this.points = [];
        this.editingIndex = null;

        this.$form = this.container.querySelector('#add-point-form');
        this.$labelInput = this.container.querySelector('#label-input');
        this.$xInput = this.container.querySelector('#x-input');
        this.$yInput = this.container.querySelector('#y-input');
        this.$list = this.container.querySelector('#point-list');

        this.initEvents();
    }

    initEvents() {
        this.$form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();

        const label = this.$labelInput.value.trim();
        const x = parseFloat(this.$xInput.value);
        const y = parseFloat(this.$yInput.value);

        if (label && !isNaN(x) && !isNaN(y)) {
            const point = { label, position: [x, y] };

            if (this.editingIndex !== null) {
                this.points[this.editingIndex] = point;
                this.editingIndex = null;
                this.$form.querySelector('button[type="submit"]').textContent = 'Add';
            } else {
                this.points.push(point);
            }

            this.updateList();
            this.notifyPointsChanged();
            this.$form.reset();
        }
    }

    updateList() {
        this.$list.innerHTML = '';
        const template = document.getElementById('point-item-template');

        this.points.forEach((point, i) => {
            const $point = template.content.cloneNode(true);
            const $labelSpan = $point.querySelector('.point-label');
            const $positionSpan = $point.querySelector('.point-position');
            const $editButton = $point.querySelector('.edit-button');
            const $deleteButton = $point.querySelector('.delete-button');

            $labelSpan.textContent = point.label;

            if (Array.isArray(point.position)) {
                $positionSpan.textContent = `(${point.position.join(', ')})`;
            }

            $editButton.addEventListener('click', () => this.startEditing(i));
            $deleteButton.addEventListener('click', () => this.removePoint(i));

            this.$list.appendChild($point);
        });
    }

    startEditing(index) {
        const point = this.points[index];

        if (!point) {
            return;
        }

        this.$labelInput.value = point.label;
        this.$xInput.value = point.position[0];
        this.$yInput.value = point.position[1];
        this.editingIndex = index;
        this.$form.querySelector('button[type="submit"]').textContent = 'Save';
    }

    addPoint(point) {
        this.points.push(point);
        this.updateList();
        this.notifyPointsChanged();
    }

    removePoint(index) {
        this.points.splice(index, 1);

        if (this.editingIndex === index) {
            this.editingIndex = null;
            this.$form.reset();
            this.$form.querySelector('button[type="submit"]').textContent = 'Add';
        }

        this.updateList();
        this.notifyPointsChanged();
    }

    setOnPointsChanged(callback) {
        this.onPointsChanged = callback;
    }

    notifyPointsChanged() {
        this.onPointsChanged?.(this.getPoints());
    }

    setPoints(pointsArray) {
        this.points = pointsArray.slice();
        this.updateList();
        this.notifyPointsChanged();
    }

    getPoints() {
        return this.points.slice();
    }
}
