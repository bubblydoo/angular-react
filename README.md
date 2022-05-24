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

### Installation

```bash
npm i @bubblydoo/angular-react
```

```ts
@NgModule({
  ...,
  imports: [
    ...,
    AngularReactModule
  ]
})
```

### Global React Context

Because this library creates a different React DOM root for each `react-wrapper`, if you want to have a global React Context, you can register it as follows:

```ts
// app.component.ts

constructor(angularReact: AngularReactService) {
  const client = new ApolloClient();
  angularReact.wrappers.push(({ children }) => React.createElement(ApolloProvider, { client, children }));
}
```

In this example, we use `ApolloProvider` to provide a client to each React element. We can then use `useQuery` in all React components.
