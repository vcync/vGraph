# Ideal Readme

This README documents the ideal state of this project. It's like TDD, but RDD.  
https://tom.preston-werner.com/2010/08/23/readme-driven-development.html

## vGraph Core

---

vGraph Core is the graph engine itself.  
The graph can be serialised and deserialised to JSON.

The `vGraphCore` class has events/callbacks for:

- node registration
- node creation
- node deletion
- current graph

## vGraph DOM

---

vGraph DOM is the built-in canvas and DOM renderer for manipulating the
vGraph Core graph.

`vGraphDOM` class is initiated with an instance of vGraphCore.  
The instance can be updated any time with
`vGraphDOM.useGraph(vGraphCore)`.

It can be serialised and deserialised to JSON, it alsos provide the vGraph
Core graph so all data can be saved and loaded in one place.

The `vGraphDOM` class stores its own data:

- properties of nodes
  - width
  - height
  - x position
  - y position
- focused node

The class hooks into callbacks for:

- node registration
  - to cache input/output types and generate a seeded random colour
- node creation
  - to create nodes in vGraph DOM and initialise position and size
- node deletion
  - to remove nodes in vGraph DOM
- current graph
  - to switch between the main/top graph and sub graphs
