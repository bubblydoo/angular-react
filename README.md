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

### Refs

You can get a ref to the Angular component instance as follows:

```tsx
import { ComponentRef } from '@angular/core';

const ref = useRef<ComponentRef<any>>();

<AngularWrapper ref={ref} />;
```

To get a reference to the Angular component's HTML element, use `ref.location.nativeElement`.

To forward a ref to a React component, you can simply use the props:

```tsx
const Message = forwardRef((props, ref) => {
  return <div ref={ref}>{props.message}</div>;
});

@Component({
  template: `<react-wrapper [component]="Message" [props]="{ ref, message }">`
})
export class MessageComponent {
  Message = Message;

  message = 'hi!';

  ref(div: HTMLElement) {
    div.innerHTML = 'hi from the callback ref!';
  }
}
```

### Using templates

#### `useAngularTemplateRef`: to convert a React component into a `TemplateRef`

```tsx
import { useAngularTemplateRef } from "@bubblydoo/angular-react";

@Component({
  selector: 'message',
  template: `
    <div>
      <ng-template [ngTemplateOutlet]="tmpl" [ngTemplateOutletContext]="{ message }"></ng-template>
    </div>
  `
})
class MessageComponent {
  @Input() tmpl: TemplateRef<{ message: string }>;
  @Input() message: string;
}

function Text(props: { message: string }) {
  return <>{props.message}</>
}

function Message(props: { message: string }) {
  const tmpl = useAngularTemplateRef(Text);

  const inputs = useMemo(() => ({
    message: props.message,
    tmpl
  }), [props.message, tmpl]);

  return <AngularWrapper component={MessageComponent} inputs={inputs} />
}
```

#### `useFromAngularTemplateRef`: to convert a `TemplateRef` into a React component

```tsx
function Message(props: {
  message: string;
  tmpl: TemplateRef<{ message: string }>;
}) {
  const Template = useFromAngularTemplateRef(props.tmpl);

  return <Template message={props.message.toUpperCase()} />;
}

@Component({
  selector: "outer",
  template: `
    <ng-template #tmpl let-message="message">{{ message }}</ng-template>
    <div>
      <react-wrapper
        [component]="Message"
        [props]="{ tmpl, message }"
      ></react-wrapper>
    </div>
  `,
})
class MessageComponent {
  Message = Message;

  @Input() message!: string;
}
```

### Context Bridging

If you're using `react-wrapper`, all context is lost by default. You can solve this in two ways:
- Put all context on `angularReactService.wrappers` (see above). This is not ideal, because there can only be one global context.
- Use `useContextBridge` from `its-fine` and wrap all React components in a `<ContextBridge>`.

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

You might want to use resolutions or overrides if you run into NG0203 errors.

```json
"resolutions": {
  "@bubblydoo/angular-react": "file:../angular-react/dist/angular-react"
}
```

## Further reading

See this blog post for the motivation and more details: [Transitioning from Angular to React, without starting from scratch](https://dev.to/bubblydoo/transitioning-from-angular-to-react-without-starting-from-scratch-j66)
