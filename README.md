# React in Angular and Angular in React

This is a small Angular library that lets you use React components inside Angular projects.

```html
<react-wrapper [component]="Button" [props]="{ children: 'Hello world!' }">
```

```tsx
function ReactComponent({ text }) {
  return <AngularWrapper component={TextComponent} inputs={{ text }}>
}
```

## Installation

```bash
npm i @bubblydoo/angular-react
```

```ts
import { AngularReactModule } from '@bubblydoo/angular-react'

@NgModule({
  ...,
  imports: [
    ...,
    AngularReactModule
  ]
})
```

## Features

### `ReactWrapperComponent`

Use this component when you want to use React in Angular.

It takes two inputs:
- `component`: A React component
- `props?`: The props you want to pass to the React component

The React component will be first rendered on `ngAfterViewInit` and rerendered on every `ngOnChanges` call.

```ts
import Button from './button.tsx';

@Component({
  template: `<react-wrapper [component]="Button" [props]="{ children: 'Hello world!' }">`
})
class AppComponent {
  Button = Button
}
```

### `AngularWrapper`

Use this component when you want to use Angular in React.

It takes a few inputs:
- `component`: An Angular component
- `inputs?`: The inputs you want to pass to the Angular component, in an object
- `outputs?`: The outputs you want to pass to the Angular component, in an object
- `events?`: The events from the Angular component to listen to, using `addEventListener`. Event handlers are wrapped in `NgZone.run`
- `ref?`: The ref to the rendered DOM element (uses `React.forwardRef`)

```tsx
import { TextComponent } from './text/text.component.ts'

function Text(props) {
  return (
    <AngularWrapper
      component={TextComponent}
      inputs={{ text: props.text }}
      events={{ click: () => console.log('clicked') }}/>
  )
}
```

### `useInjected`

The Angular Injector is provided on each React component by default using React Context. You can use Angular services and other injectables with it:

```tsx
import { useInjected } from '@bubblydoo/angular-react'

const authService = useInjected(AuthService)
```

### `useObservable`

Because consuming observables is so common, we added a helper hook for it:

```tsx
import { useObservable, useInjected } from '@bubblydoo/angular-react'

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

## Further reading

See this blog post for the motivation and more details: [Transitioning from Angular to React, without starting from scratch](https://dev.to/bubblydoo/transitioning-from-angular-to-react-without-starting-from-scratch-j66)
