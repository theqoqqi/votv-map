# Interactive map for Voices of the Void

The map is hosted at [GitHub Pages](https://theqoqqi.github.io/votv-map/).

This is an interactive web map that allows you to add or import your points and view them on the VotV map.
I made it for myself to make it easier to think about the location of objects in my mod for this game.

### Features

- **Interactive Map**: Zoom in, zoom out, and move the map.
- **Point Management**: Add, edit, and remove points easily.
- **JSON Import**: Import points from a JSON string.
- **Persistent Data**: Points are saved in the browser's local storage.

### JSON Import format

The JSON import format is a list of objects, where each object has a `label` and a `position` array.
The `position` array contains two numbers: the X and Y coordinates of the point.

For example:

```json
[
    { "label": "Point 1", "position": [-11.17, 0.32] },
    { "label": "Point 2", "position": [22.33, -44.1] }
]
```

You can also specify additional properties for each point, such as `color`, `size`, `borderColor`, and `borderWidth`.
These properties are optional — if not specified, default values will be used.

All possible properties:

- `label`: The label of the point.
- `position`: The X and Y coordinates of the point.
- `color`: The color of the point. Should be a valid CSS color value.
- `size`: The size of the point.
- `borderColor`: The color of the point border. Should be a valid CSS color value.
- `borderWidth`: The width of the point border.

For example:

```json
[
    {
        "label": "Point 3",
        "position": [ 111, 222 ],
        "color": "green",
        "size": 10,
        "borderColor": "darkgreen",
        "borderWidth": 2
    }
]
```

### Credits
The background image used in this project is from the following repository:  
[Questwalker/votv-map](https://github.com/Questwalker/votv-map).
