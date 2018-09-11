
# You Might Not Need Redux

People often choose Redux before they need it. “What if our app doesn’t scale without it?” Later, developers frown at the indirection Redux introduced to their code. “Why do I have to touch three files to get a simple feature working?” Why indeed\!

People blame Redux, React, functional programming, immutability, and many other things for their woes, and I understand them. It is natural to compare Redux to an approach that doesn’t require “boilerplate” code to update the state, and to conclude that Redux is just complicated. In a way it is, and by design so.

Redux offers a tradeoff. It asks you to:

- Describe application state as plain objects and arrays.
- Describe changes in the system as plain objects.
- Describe the logic for handling changes as pure functions.

None of these limitations are required to build an app, with or without React. In fact these are pretty strong constraints, and you should think carefully before adopting them even in parts of your app.

Do you have good reasons for doing so?

These limitations are appealing to me because they help build apps that:

- [Persist state to a local storage and then boot up from it, out of the box.](https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage?course=building-react-applications-with-idiomatic-redux)
- [Pre\-fill state on the server, send it to the client in HTML, and boot up from it, out of the box.](http://redux.js.org/docs/recipes/ServerRendering.html)
- [Serialize user actions and attach them, together with a state snapshot, to automated bug reports, so that the product developers can replay them to reproduce the errors.](https://github.com/dtschust/redux-bug-reporter)
- [Pass action objects over the network to implement collaborative environments without dramatic changes to how the code is written.](https://github.com/philholden/redux-swarmlog)
- [Maintain an undo history or implement optimistic mutations without dramatic changes to how the code is written.](http://redux.js.org/docs/recipes/ImplementingUndoHistory.html)
- [Travel between the state history in development, and re\-evaluate the current state from the action history when the code changes, a la TDD.](https://github.com/gaearon/redux-devtools)
- [Provide full inspection and control capabilities to the development tooling so that product developers can build custom tools for their apps.](https://github.com/romseguy/redux-devtools-chart-monitor)
- [Provide alternative UIs while reusing most of the business logic.](https://youtu.be/gvVpSezT5_M?t=11m51s)

If you’re working on [an extensible terminal](https://hyperterm.org/), [a JavaScript debugger](https://hacks.mozilla.org/2016/09/introducing-debugger-html/), or [some kinds of webapps](https://twitter.com/necolas/status/727538799966715904), it might be worth giving it a try, or at least considering some of its ideas \(they are [not](https://github.com/evancz/elm-architecture-tutorial) [new](https://github.com/omcljs/om), by the way\!\)

However, if you’re just learning React, don’t make Redux your first choice.

Instead learn to [think in React](https://facebook.github.io/react/docs/thinking-in-react.html). Come back to Redux if you find a real need for it, or if you want to try something new. But approach it with caution, just like you do with any highly opinionated tool.

If you feel pressured to do things “the Redux way”, it may be a sign that you or your teammates are taking it too seriously. It’s just one of the tools in your toolbox, [an experiment](https://www.youtube.com/watch?v=xsSnOQynTHs) [gone wild](https://www.youtube.com/watch?v=uvAXVMwHJXU).

Finally, don’t forget that you can apply ideas from Redux without using Redux. For example, consider a React component with local state:

~~~JavaScript
import React, { Component } from 'react';

class Counter extends Component {
  state = { value: 0 };

  increment = () => {
    this.setState(prevState => ({
      value: prevState.value + 1
    }));
  };

  decrement = () => {
    this.setState(prevState => ({
      value: prevState.value - 1
    }));
  };
  
  render() {
    return (
      <div>
        {this.state.value}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}
~~~


It is *perfectly fine* as it is. Seriously, it bears repeating.

*Local state is fine.*

The tradeoff that Redux offers is to *add indirection* to decouple “what happened” from “how things change”.

Is it always a good thing to do? No. It’s a tradeoff.

For example, we can extract a reducer from our component:

~~~JavaScript
import React, { Component } from 'react';

const counter = (state = { value: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { value: state.value + 1 };
    case 'DECREMENT':
      return { value: state.value - 1 };
    default:
      return state;
  }
}

class Counter extends Component {
  state = counter(undefined, {});
  
  dispatch(action) {
    this.setState(prevState => counter(prevState, action));
  }

  increment = () => {
    this.dispatch({ type: 'INCREMENT' });
  };

  decrement = () => {
    this.dispatch({ type: 'DECREMENT' });
  };
  
  render() {
    return (
      <div>
        {this.state.value}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}
~~~


Notice how we just used Redux without running *npm install.* Wow\!

Should you do this to your stateful components? Probably not. That is, *not unless you have a plan* to benefit from this additional indirection. Having a plan is, in the parlance of our times, the 🔑.

[Redux library](http://redux.js.org/) itself is only a set of helpers to “mount” reducers to a single global store object. You can use as little, or as much of Redux, as you like.

But if you trade something off, make sure you get something in return.

⚛
