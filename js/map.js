
export default class Map {

    constructor(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.points = [];

        this.offsetX = 0;
        this.offsetY = 0;
        this.isPanning = false;
        this.startPanX = 0;
        this.startPanY = 0;

        this.zoom = options.zoom.initial ?? 1;
        this.minZoom = options.zoom.min ?? 0.5;
        this.maxZoom = options.zoom.max ?? 10;

        this.bgOffsetX = 0;
        this.bgOffsetY = 0;
        this.bgWorldSize = options.background.worldSize;
        this.bgOffsetPixels = options.background.offsetInImagePixels;
        this.bgImage = new Image();
        this.bgImage.src = options.background.url;
        this.bgImage.onload = () => {
            this.resolveBackgroundOffset();
            this.draw();
        };
        this.bgImage.onerror = () => console.error('Failed to load background image.');

        this.initEvents();
        this.resizeCanvas();
        this.setPoints(options.points ?? []);
    }

    // region Event Handlers

    resolveBackgroundOffset() {
        this.bgOffsetX = (this.bgOffsetPixels.x ?? 0) * (this.bgWorldSize.x / this.bgImage.width);
        this.bgOffsetY = (this.bgOffsetPixels.y ?? 0) * (this.bgWorldSize.y / this.bgImage.height);
    }

    initEvents() {
        this.canvas.addEventListener('wheel', (e) => this.handleZoom(e));
        this.canvas.addEventListener('mousedown', (e) => this.startPan(e));
        this.canvas.addEventListener('mousemove', (e) => this.pan(e));
        this.canvas.addEventListener('mouseup', () => this.endPan());

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    handleZoom(event) {
        const sensitivity = 0.001;
        const rect = this.canvas.getBoundingClientRect();

        const delta = -event.deltaY * sensitivity;
        const newZoom = this.clamp(this.zoom * (1 + delta), this.minZoom, this.maxZoom);

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const offsetX = mouseX - ((mouseX - this.offsetX) * (newZoom / this.zoom));
        const offsetY = mouseY - ((mouseY - this.offsetY) * (newZoom / this.zoom));

        this.zoom = newZoom;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.draw();
    }

    startPan(event) {
        this.isPanning = true;
        this.startPanX = event.clientX - this.offsetX;
        this.startPanY = event.clientY - this.offsetY;
    }

    pan(event) {
        if (!this.isPanning) {
            return;
        }

        this.offsetX = event.clientX - this.startPanX;
        this.offsetY = event.clientY - this.startPanY;
        this.draw();
    }

    endPan() {
        this.isPanning = false;
    }

    resizeCanvas() {
        const size = Math.max(window.innerWidth, window.innerHeight);
        this.canvas.width = size;
        this.canvas.height = size;
        this.draw();
    }

    // endregion

    // region Getters and Setters

    setPoints(points) {
        this.points = [...points];
        this.draw();
    }

    getPoints() {
        return [...this.points];
    }

    // endregion

    // region Drawing

    draw() {
        this.drawBackground();
        this.drawAxisLines();
        this.drawBorders();
        this.drawPoints();
    }

    drawBackground() {
        this.clearBackground();
        this.drawBackgroundImage();
    }

    clearBackground() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackgroundImage() {
        if (!this.bgImage.complete) {
            return;
        }

        const imageX = this.worldToCanvasX(this.bgOffsetX - this.bgWorldSize.x / 2);
        const imageY = this.worldToCanvasY(this.bgOffsetY + this.bgWorldSize.y / 2);
        const imageWidth = this.worldToCanvasX(this.bgOffsetX + this.bgWorldSize.x / 2) - imageX;
        const imageHeight = this.worldToCanvasY(this.bgOffsetY + -this.bgWorldSize.y / 2) - imageY;

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.bgImage, imageX, imageY, imageWidth, imageHeight);
        this.ctx.imageSmoothingEnabled = true;
    }

    drawAxisLines() {
        this.ctx.strokeStyle = '#ffffff88';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(this.worldToCanvasX(0), 0);
        this.ctx.lineTo(this.worldToCanvasX(0), this.canvas.height);
        this.ctx.moveTo(0, this.worldToCanvasY(0));
        this.ctx.lineTo(this.canvas.width, this.worldToCanvasY(0));
        this.ctx.stroke();
    }

    drawBorders() {
        this.drawBorder(700.5, 'black', 1);
        this.drawBorder(875, 'white', 2);
    }

    drawBorder(distanceFromCenter, color, size) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = size;

        this.ctx.beginPath();
        this.ctx.moveTo(this.worldToCanvasX(-distanceFromCenter), this.worldToCanvasY(distanceFromCenter));
        this.ctx.lineTo(this.worldToCanvasX(distanceFromCenter), this.worldToCanvasY(distanceFromCenter));
        this.ctx.lineTo(this.worldToCanvasX(distanceFromCenter), this.worldToCanvasY(-distanceFromCenter));
        this.ctx.lineTo(this.worldToCanvasX(-distanceFromCenter), this.worldToCanvasY(-distanceFromCenter));
        this.ctx.lineTo(this.worldToCanvasX(-distanceFromCenter), this.worldToCanvasY(distanceFromCenter));
        this.ctx.stroke();
    }

    drawPoints() {
        this.points.forEach(point => {
            const [x, y] = point.position;
            const canvasX = this.worldToCanvasX(x);
            const canvasY = this.worldToCanvasY(y);

            this.drawPoint(point, canvasX, canvasY);
            this.drawPointLabel(point, canvasX, canvasY);
        });
    }

    drawPoint(point, canvasX, canvasY) {
        const pointZoom = this.lerp(1, this.zoom, 0);
        const size = (point.size ?? 5) * pointZoom;

        this.ctx.fillStyle = point.color ?? 'red';
        this.ctx.strokeStyle = point.borderColor ?? 'black';
        this.ctx.lineWidth = point.borderSize ?? 1;

        this.ctx.beginPath();
        this.ctx.arc(canvasX, canvasY, size, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawPointLabel(point, canvasX, canvasY) {
        const fontZoom = this.lerp(1, this.zoom, 0);
        const fontSize = 16 * fontZoom;
        const textOffsetX = 8 * fontZoom;
        const textOffsetY = -8 * fontZoom;

        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.lineWidth = 3;

        this.ctx.strokeText(point.label, canvasX + textOffsetX, canvasY + textOffsetY);
        this.ctx.fillText(point.label, canvasX + textOffsetX, canvasY + textOffsetY);
    }

    // endregion

    // region Utils

    worldToCanvasX(x) {
        const normalized = (x + 1000) / 2000;

        return normalized * this.canvas.width * this.zoom + this.offsetX;
    }

    worldToCanvasY(y) {
        const normalized = (y + 1000) / 2000;

        return normalized * this.canvas.height * this.zoom + this.offsetY;
    }

    lerp(from, to, t) {
        return from + (to - from) * t;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // endregion
}
