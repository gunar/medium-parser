
![](https://cdn-images-1.medium.com/max/2000/1*V9ApSONZ6xx4DX6kgWvJ1w.png)

# Tips to optimise rendering of a set of elements in React

There is a guide to increase React performance. The advanced tip will increase speed by 20 times.

Rendering a list of some elements in a page is a common task for almost any web\-app. In this post I would like to show how to improve performance for that case.

For a test example we will create app that draws a set of targets \(circles\) on the \<canvas\> element. I will use Redux for a data storage. But these tips can be applied for many other state managing approaches. Also, you can use these tips with [react\-redux](https://github.com/reactjs/react-redux), but for a clear explanation I will not use it.

Let me start from store definition.

~~~JavaScript
function generateTargets() {
    return _.times(1000, (i) => {
        return {
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 2 + Math.random() * 5,
            color: Konva.Util.getRandomColor()
        };
    });
}

// for test case our logic will be very simple
// just one action UPDATE for updating radius of a target
function appReducer(state, action) {
   if (action.type === 'UPDATE') {
       const i = _.findIndex(state.targets, (t) => t.id === action.id);
       const updatedTarget = {
           ...state.targets[i],
           radius: action.radius
       };
       state = {
           targets: [
               ...state.targets.slice(0, i),
               updatedTarget,
               ...state.targets.slice(i + 1)
           ]
       }
   }
   return state;
}

const initialState = {
    targets: generateTargets()
};
// create redux store
const store = Redux.createStore(appReducer, initialState);
~~~


Then define our application rendering. I will use [react\-konva](https://github.com/lavrton/react-konva) for canvas rendering.

~~~JavaScript
function Target(props) {
    const {x, y, color, radius} = props.target;
    return (
        <Group x={x} y={y}>
            <Circle
                radius={radius}
                fill={color}
            />
            <Circle
                radius={radius * 1 / 2}
                fill="black"
            />
            <Circle
                radius={radius * 1 / 4}
                fill="white"
            />
        </Group>
    );
}

// top component with list of targets
class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = store.getState();
        // subscibe to all state updates
        store.subscribe(() => {
            this.setState(store.getState());
        });
    }
    render() {
        const targets = this.state.targets.map((target) => {
            return <Target key={target.id} target={target}/>;
        });
        const width = window.innerWidth;
        const height = window.innerHeight;
        return (
            <Stage width={width} height={height}>
                <Layer hitGraphEnabled={false}>
                    {targets}
                </Layer>
            </Stage>
        );
    }
}
~~~


The result of this application will be:



Now let’s create a simple test script that will run several updates on one target:

~~~JavaScript
const N_OF_RUNS = 500;
const start = performance.now();
_.times(N_OF_RUNS, () => {
    const id = 1;
    let oldRadius = store.getState().targets[id].radius;
    // update redux store
    store.dispatch({type: 'UPDATE', id, radius: oldRadius + 0.5});
});
const end = performance.now();

console.log('sum time', end - start);
console.log('average time', (end - start) / N_OF_RUNS);
~~~


Let’s run test script for the app without any optimisations. On my machine, an update will take \~21ms.

![Time for rendering without optimisation](https://cdn-images-1.medium.com/max/1600/1*z0SpM9PLv1_Omn8YfY0qGg.png)

This time doesn’t include canvas drawing, only redux + react code because **react\-konva** is drawing objects only on the next animation frame tick. We are not interested in a canvas optimisation right now, it can be a subject of another post.

So \~21ms for 1000 elements is pretty good performance. If we update elements rarely we can keep this code the way it is.

But I had a case where I need to execute update very frequently \(on every mouse move during drag&drop\). For 60 FPS animation, each update should take no more than **16ms**. So 21ms is not so good for this case \(plus will have canvas drawing\).

How can we optimise rendering?

## 1 Don’t update unchanged elements

This is a first rule to improve React performance. All we need is to implement \`shouldComponentUpdate\` for Target Element:

~~~JavaScript
class Target extends React.Component {
    shouldComponentUpdate(newProps) {
        return this.props.target !== newProps.target;
    }
    render() {
        const {x, y, color, radius} = this.props.target;
        return (
            <Group x={x} y={y}>
                <Circle
                    radius={radius}
                    fill={color}
                />
                <Circle
                    radius={radius * 1 / 2}
                    fill="black"
                />
                <Circle
                    radius={radius * 1 / 4}
                    fill="white"
                />
            </Group>
        );
    }
}
~~~


Result for this update \([http:\/\/codepen.io\/lavrton\/pen\/XdPGqj](http://codepen.io/lavrton/pen/XdPGqj)\):

![Time for rendering with a simple classic optimisation](https://cdn-images-1.medium.com/max/1600/1*ZnE4yeMaFzd-w_BsA2B-DA.png)

Wow. \~4ms vs 21ms. This is much better. But can we do more? In my real app even after this optimisation the performance was bad.

## Advanced tuning

Now take a look into “render\(\)” function of App component. The thing I don’t like in this code is that \`render\(\)\` of app component will be called on EACH update.

That means we have more that 1000 calls for **React.createElement** for each target. In this case, it works fast but in larger apps it can be slow.

Why should we rerender the whole list if we know that only particular components are updated? Can we just directly update them?

## 2 Make child components smarter

The idea is simple:

- Don’t update the app component if a list has the same number of elements and order of elements is the same
- Children components should update itself if data is changed

So “Target” component should subscribe to store and track changes:

~~~JavaScript
class Target extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
            target: store.getState().targets[this.props.index]
        };
        // subscibe to all state updates
        this.unsubscribe = store.subscribe(() => {
            const newTarget = store.getState().targets[this.props.index];
            if (newTarget !== this.state.target) {
                this.setState({
                    target: newTarget
                });
            }
        });
    }
    shouldComponentUpdate(newProps, newState) {
         return this.state.target !== newState.target;
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    render() {
        const {x, y, color, radius} = this.state.target;
        return (
            <Group x={x} y={y}>
                <Circle
                    radius={radius}
                    fill={color}
                />
                <Circle
                    radius={radius * 1 / 2}
                    fill="black"
                />
                <Circle
                    radius={radius * 1 / 4}
                    fill="white"
                />
            </Group>
        );
    }
}
~~~


And implement “shouldComponentUpdate” for App component:

~~~JavaScript
shouldComponentUpdate(newProps, newState) {
    // check if order or length of list is changed
    // if all ids are the same it means no "significant" changes
    const changed = newState.targets.find((target, i) => {
        return this.state.targets[i].id !== target.id;
    });
    return changed;
}
~~~


Result after that changes \([http:\/\/codepen.io\/lavrton\/pen\/bpxZjy](http://codepen.io/lavrton/pen/bpxZjy)\):

![Time for rendering with an advanced optimisation](https://cdn-images-1.medium.com/max/1600/1*X9hn6avuPR_rFo4YbTs5qg.png)

**0.25ms** for an update is much better now.

## Bonus tip

Use [https:\/\/github.com\/mobxjs\/mobx](https://github.com/mobxjs/mobx) to skip all of this subscribing code. Same app using **mobx** \([http:\/\/codepen.io\/lavrton\/pen\/WwPaeV](http://codepen.io/lavrton/pen/WwPaeV)\):

![Time for rendering with mobx state](https://cdn-images-1.medium.com/max/1600/1*UeXn__Z13U-fDFsSd3KLFQ.png)

About 1.5x faster than the previous result \(and difference will be much more if you have more elements\). And code is much simpler:

~~~JavaScript
const {Stage, Layer, Circle, Group} = ReactKonva;
const {observable, computed} = mobx;
const {observer} = mobxReact;

class TargetModel {
    id = Math.random();
    @observable x = 0;
    @observable y = 0;
    @observable radius = 0;
    @observable color = null;
    constructor(attrs) {
        _.assign(this, attrs);
    }
}

class State {
    @observable targets = [];
}

function generateTargets() {
     _.times(1000, (i) => {
        state.targets.push(new TargetModel({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 2 + Math.random() * 5,
            color: Konva.Util.getRandomColor()
        }));
    });
}

const state = new State();
generateTargets();

@observer
class Target extends React.Component {
    render() {
        const {x, y, color, radius} = this.props.target;
        return (
            <Group x={x} y={y}>
                <Circle
                    radius={radius}
                    fill={color}
                />
                <Circle
                    radius={radius * 1 / 2}
                    fill="black"
                />
                <Circle
                    radius={radius * 1 / 4}
                    fill="white"
                />
            </Group>
        );
    }
}

@observer
class App extends React.Component {
    render() {
        const targets = state.targets.map((target) => {
            return <Target key={target.id} target={target}/>;
        });
        const width = window.innerWidth;
        const height = window.innerHeight;
        return (
            <Stage width={width} height={height}>
                <Layer hitGraphEnabled={false}>
                    {targets}
                </Layer>
            </Stage>
        );
    }
}

ReactDOM.render(
  <App/>,
  document.getElementById('container')
);

// update one target
state.targets[1].radius += 0.5

~~~


Do you have performance issues with your web\-app? [I can help you.](https://lavrton.com/web-perf.html)