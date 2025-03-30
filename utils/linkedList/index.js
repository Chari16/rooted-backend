class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class CircularLinkedList {
  constructor() {
    this.head = null;
  }

  // Insert at the end
  append(value) {
    let newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      newNode.next = this.head; // Circular link
    } else {
      let temp = this.head;
      while (temp.next !== this.head) {
        temp = temp.next;
      }
      temp.next = newNode;
      newNode.next = this.head;
    }
  }

  // Insert at the beginning
  prepend(value) {
    let newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      newNode.next = this.head;
    } else {
      let temp = this.head;
      while (temp.next !== this.head) {
        temp = temp.next;
      }
      newNode.next = this.head;
      temp.next = newNode;
      this.head = newNode;
    }
  }

  // Delete a node by value
  delete(value) {
    if (!this.head) return;

    let curr = this.head;
    let prev = null;

    // If head is the node to be deleted
    if (curr.value === value) {
      while (curr.next !== this.head) {
        curr = curr.next;
      }
      if (this.head === this.head.next) {
        this.head = null; // Only one node case
      } else {
        curr.next = this.head.next;
        this.head = this.head.next;
      }
      return;
    }

    // Searching for the node to delete
    prev = this.head;
    curr = this.head.next;
    while (curr !== this.head) {
      if (curr.value === value) {
        prev.next = curr.next;
        return;
      }
      prev = curr;
      curr = curr.next;
    }
  }

  // Display the circular linked list
  display() {
    if (!this.head) {
      console.log("List is empty");
      return;
    }

    let temp = this.head;
    let result = [];
    do {
      result.push(temp.value);
      temp = temp.next;
    } while (temp !== this.head);

    console.log(result.join(" -> ") + " -> (circular)");
  }

	getCurrentValue(node) {
    if (!node) {
      console.log("Node is null or undefined");
      return null;
    }
    return node.value;
  }
}

// Example Usage:
// let cll = new CircularLinkedList();
// cll.append(10);
// cll.append(20);
// cll.append(30);
// cll.prepend(5);
// cll.display(); // Output: 5 -> 10 -> 20 -> 30 -> (circular)
// cll.display(); // Output: 5 -> 10 -> 30 -> (circular)

// let currentNode =  cll.head;
// console.log("Current Node Value:", cll.getCurrentValue(currentNode));
// currentNode = currentNode.next;
// console.log("Current Node Value:", cll.getCurrentValue(currentNode));
// currentNode = currentNode.next;
// console.log("Current Node Value:", cll.getCurrentValue(currentNode));
// currentNode = currentNode.next;
// console.log("Current Node Value:", cll.getCurrentValue(currentNode));
// currentNode = currentNode.next;
// console.log("Current Node Value:", cll.getCurrentValue(currentNode));
// currentNode = currentNode.next;
// console.log("Current Node Value:", cll.getCurrentValue(currentNode));

module.exports = CircularLinkedList;