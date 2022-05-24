# React in Angular and Angular in React

This is a small Angular library that lets you use React components inside Angular projects.

```html
<react-wrapper [component]="Button" [props]="{ children: 'Hello world!' }">
```

```tsx
function ReactComponent(props) {
  return <AngularWrapper component={TextComponent} inputs={{ text: props.text }}>
}
```
