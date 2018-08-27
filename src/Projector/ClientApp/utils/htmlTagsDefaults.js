import { rawJs } from './irdom';
import { TYPES } from '~/utils/convert';

export default {
  input: {
    props: {
      defaultValue: { type: TYPES.STRING, value: 'Initial Value' },
      placeholder: { type: TYPES.STRING, value: 'Placeholder' },
      type: { type: TYPES.STRING, value: 'text' },
    }
  },
  select: {
    props: {
      defaultValue: { type: TYPES.STRING, value: 'chocolate' },
      onChange: { type: TYPES.DYNAMIC, value: rawJs('function(event) {\n  var option = event.target;\n  var value = option.value;\n  alert("You selected " + option.value);\n}') },
    },
  },
  option: {
    props: {
      value: { type: TYPES.STRING, value: 'chocolate' },
    },
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Chocolate' } } }]
  },
  button: {
    props: {
      type: { type: TYPES.STRING, value: 'button' },
      onClick: { type: TYPES.DYNAMIC, value: rawJs('function(event) {\n  alert("WOW! You really did click me!");\n}') },
    },
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Click Me' } } }]
  },
  h1: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Heading 1' } } }]
  },
  h2: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Heading 2' } } }]
  },
  h3: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Heading 3' } } }]
  },
  h4: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Heading 4' } } }]
  },
  h5: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Heading 5' } } }]
  },
  h6: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Heading 6' } } }]
  },
  p: {
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non eleifend lacus. Donec egestas augue et libero imperdiet pretium. Ut tristique leo ut magna condimentum egestas vel at neque. Praesent vel mauris.' } } }]
  },
  img: {
    props: {
      src: { type: TYPES.STRING, value: 'http://placehold.it/320x240?text=CreoWeb' },
      width: { type: TYPES.NUMBER, value: 320 },
      height: { type: TYPES.NUMBER, value: 240 },
    },
  },
  a: {
    props: {
      href: { type: TYPES.STRING, value: '/' },
    },
    children: [{ component: '#text', props: { text: { type: TYPES.STRING, value: "CreoWeb Homepage" } } }],
  },
}