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

### `useInjected`

The Angular Injector is provided on each React component by default using React Context. You can use Angular services and other injectables with it:

```tsx
const authService = useInjected(AuthService)
```

### `useObservable`

Because consuming observables is so common, we added a helper hook for it:

```tsx
import { useObservable } from '@bubblydoo/react-angular'

function LoginStatus() {
  const authService = useInjected(AuthService)

  const [value, error, completed] = useObservable(authService.isAuthenticated$)

  if (error) return <>Something went wrong!<>

  return <>{value ? "Logged in!" : "Not logged in"}</>
}
```

### Global React Context

Because this library creates a different ReactDOM root for each `react-wrapper`, if you want to have a global React Context, you can register it as follows:

```ts
// app.component.ts

constructor(angularReact: AngularReactService) {
  const client = new ApolloClient();
  // equivalent to ({ children }) => <ApolloProvider client={client}>{children}</ApolloProvider>
  angularReact.wrappers.push(({ children }) => React.createElement(ApolloProvider, { client, children }));
}
```

In this example, we use `ApolloProvider` to provide a client to each React element. We can then use `useQuery` in all React components.

## Developing

You can test the functionality of the components inside a local Storybook:

```bash
npm run storybook
```

If you want to use your local build in an Angular project, you'll need to build it:

```bash
npm run build
```

Then, use `npm link`:

```bash
cd dist/angular-react
npm link # this will link @bubblydoo/angular-react to dist/angular-react
```

In your Angular project:

```
npm link @bubblydoo/angular-react
```

`node_modules/@bubblydoo/angular-react` will then be symlinked to `dist/angular-react`.
