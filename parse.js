parser = advn["idmap"]
max_lv = advn["max_lv"]
cost_book = advn["enchant_cost"]["book"]
cost_item = advn["enchant_cost"]["item"]
enchantbytool = advn["enchantbytool"]
toolsname = Object.keys(enchantbytool).sort()
displayfun = (str) => str.replaceAll("_", " ")
comparer = (a,b) => parser[a].localeCompare(parser[b])
sorted = (lst, key) => {lst.sort(key); return lst;}
selectable_tools = () => {
    let outvalue = document.getElementById("selectoutput").getAttribute("value")
    if(outvalue!==null && outvalue !==undefined && outvalue.trim()!=="")
        return [outvalue, "enchanted_book"]
    let ar = Array.from(document.querySelectorAll("#input select"))
              .map(ele => ele.getAttribute("value"))
              .filter(value => value!==null && value!==undefined && value.trim()!==""
                      && value!=="enchanted_book")
    if(ar.length > 0)
          return [ar[0], "enchanted_book"]
    return toolsname
}

function updateDropDown(node) {
    if(node===undefined || node===null)
        document.getElementById("selectoutput").innerHTML = [" "].concat(selectable_tools()).reduce((acc, cur) => acc + "<option value=" +cur+">"+cur.replaceAll("_", " ")+"</option>", "")

    Array.from(document.querySelectorAll("#input select"))
            .filter(ele=>ele!==node && (ele.getAttribute("value")===undefined
                    || ele.getAttribute("value")===null
                    || ele.getAttribute("value").trim()===""))
            .forEach(ele =>
        ele.innerHTML = [" "].concat(selectable_tools()).reduce((acc, cur) => acc + "<option value=" +cur+">"+cur.replaceAll("_", " ")+"</option>", "")
    )
}


document.getElementById("datalist-area").innerHTML =
  Object.keys(enchantbytool).reduce((acc, key) => {
      let node = "<datalist id='"+key+"'>"
      sorted(enchantbytool[key], key=(a,b)=>a-b).forEach(eid => {
          node += "<option value='"+displayfun(parser[eid])+"'>"
      })
      node += "</datalist>"
      return acc + node
  }, "")




function addInputItem() {
      let outer = document.createElement("div")
      outer.classList.add("input-enchant-item")
      outer.innerHTML = "<hr>Input Item: "

      let dropdown = document.createElement("select")
      dropdown.innerHTML = [" "].concat(selectable_tools()).reduce((acc, cur) => acc + "<option value=" +cur+">"+cur.replaceAll("_", " ")+"</option>", "")
      dropdown.addEventListener("change", e => {
          let node = e.target
          let value = node.value
          let enchlist = node.parentNode.lastElementChild
          enchlist.setAttribute("value", value)
          node.setAttribute("value", value)
          updateDropDown(e.target)
          if(value.trim()==="") {
              document.getElementById("input").removeChild(node.parentNode)
              return;
          }
          if(node.parentNode.lastElementChild===node) {
              node.parentNode.appendChild(addEnchantmentList(value))
              document.getElementById("input").appendChild(addInputItem())
          } else {
              enchlist.innerHTML = ""
              enchlist.appendChild(addEnchantmentListItem(value))
          }
      })
      dropdown.setAttribute("title", "select an item")
      outer.appendChild(dropdown)
      return outer
}

function addEnchantmentListItem(item_value) {
      let inner = document.createElement("div")
      inner.classList.add("enchantment-list-item")

      let enchant_lv = document.createElement("div")
      enchant_lv.innerHTML = ""
      enchant_lv.contenteditable = 'false'
      enchant_lv.classList.add("enchantment-list-lv")
      enchant_lv.setAttribute("title", "click to change level")
      enchant_lv.addEventListener("focusout", e => {
          let node = e.target
          let parent = node.parentNode
          let lv = parseInt(node.innerText);
          let eid = parser[parent.lastElementChild.getAttribute("value")]
          if(typeof lv === "number" && lv > 0) {
              lv = Math.min(lv, max_lv[Number(eid).toString()])
              node.innerHTML = lv
          } else {
              parent.parentNode.removeChild(parent)
          }
      })

      let enchant_minus = document.createElement("div")
      enchant_minus.classList.add("enchantment-list-minus-lv")
      enchant_minus.setAttribute("title", "reduce 1 level")
      enchant_minus.addEventListener("click", e => {
          let node = e.target.parentNode.firstElementChild
          node.innerHTML = Math.max(1, parseInt(node.innerHTML) - 1)
      })

      let enchant_max = document.createElement("div")
      enchant_max.classList.add("enchantment-list-max-lv")
      enchant_max.setAttribute("title", "set to max level")
      enchant_max.addEventListener("click", e => {
          let node = e.target.parentNode.firstElementChild
          node.innerHTML = node.getAttribute("max_lv")
      })


      let enchant_input = document.createElement("input")
      enchant_input.setAttribute("list", item_value)
      enchant_input.setAttribute("placeholder", "enchant with")
      enchant_input.setAttribute("title", "click to select enchantment")
      enchant_input.addEventListener("focusout", e=> {
          let node = e.target
          let value = node.value.replaceAll(" ", "_")
          if(value.trim() === "") {
              if(node.parentNode.parentNode.lastElementChild!==node.parentNode)
                  node.parentNode.parentNode.removeChild(node.parentNode)
              return;
          }
          node.setAttribute("value", value)
          let lv = node.parentNode.firstElementChild
          let max_lv_value = max_lv[Number(parser[value]).toString()]
          lv.setAttribute("contenteditable", 'true')
          lv.setAttribute("max_lv", max_lv_value)
          lv.innerHTML = "1"
          let max_lv_node = node.parentNode.children[2]
          max_lv_node.innerHTML = "(max. "+max_lv_value+")"

          node.parentNode.children[1].innerHTML = "<"

          if(node.parentNode.parentNode.lastElementChild===node.parentNode) {
              let item_value = enchant_input.getAttribute("list")
              node.parentNode.parentNode.appendChild(addEnchantmentListItem(item_value))
          }
      })
      inner.appendChild(enchant_lv)
      inner.appendChild(enchant_minus)
      inner.appendChild(enchant_max)
      inner.appendChild(enchant_input)
      return inner
}



function addEnchantmentList(item_value) {
    let outer = document.createElement("div")
    outer.classList.add("enchantment-list")
    outer.appendChild(addEnchantmentListItem(item_value))
    outer.setAttribute("value", item_value)
    return outer
}


document.getElementById("input").appendChild(addInputItem())
updateDropDown()

function validate_goal_level_node(node) {
    let lv = parseInt(node.innerText);
    let gp = parseInt(node.getAttribute("group"))
    let eid = parser[node.parentNode.parentNode.getAttribute("value")]
    if(typeof lv === "number" && lv > 0) {
        lv = Math.min(lv, max_lv[Number(eid).toString()])
        node.parentNode.parentNode.setAttribute("lv", lv);
        node.parentNode.parentNode.classList.add("highlight")
        node.innerHTML = lv
        if(gp > 0) {
            Array.from(document.getElementById("output-enchantments").childNodes)
                .filter(node2 => node2.tagName.toUpperCase() === "DIV")
                .map(node2 => node2.lastElementChild.firstElementChild)
                .filter(node2 => parseInt(node2.getAttribute("group")) === gp && node2!==node)
                .forEach(ele => {
                    ele.innerHTML = 0
                    ele.parentNode.parentNode.classList.remove("highlight")
                })
        }
    } else {
        lv = Math.max(0, lv)
        node.innerHTML = 0
        node.parentNode.parentNode.classList.remove("highlight")
    }
}


function validate_goal_level(e) {
    validate_goal_level_node(e.target)
}

document.getElementById("selectoutput").addEventListener("change", e => {
    let value = e.target.value
    e.target.setAttribute("value", value)
    updateDropDown(e.target)
    if(value.trim()==="") {
        document.getElementById("output-enchantments").innerHTML = ""
        return;
    }
    let res_enchant_lst = sorted(enchantbytool[value], key=comparer)

    let n_group = 1
    if(enchantbytool[value].filter(eid => Object.keys(conflicts).indexOf(eid)!==-1).length > 0) {
        let groups = []
        let idx = 0
        while (res_enchant_lst.length > idx) {
            let eid = res_enchant_lst[idx]
            if(Object.keys(conflicts).indexOf(eid)!==-1) {
                groups.push(conflicts[eid].map(ele=>Number(ele).toString()).filter(eid2 => res_enchant_lst.indexOf(eid2) !==-1 ).concat([eid]))
                res_enchant_lst = res_enchant_lst.filter(eid => groups.reduce((acc, cur) => acc.concat(cur), []).indexOf(eid)===-1)
          } else
              idx += 1
        }
        groups.push(res_enchant_lst)
        res_enchant_lst = groups
        n_group = res_enchant_lst.length
        res_enchant_lst = res_enchant_lst.reduce((acc, cur) => acc.concat([null]).concat(cur),[])
    }

    document.getElementById("output-enchantments").innerHTML =
    res_enchant_lst.reduce((acc, cur) => {
        if(cur === null) {
            n_group -= 1
            return acc + "<hr>"
        }
        return acc + "<div class='enchantment' value='"+parser[cur]+"'>"+displayfun(parser[cur])
                +"<div class='lv_wrap'><div group="+n_group+" onfocusout='validate_goal_level(event)' class='lv' title='click to change level' contenteditable='true'>0</div>"
                + " <div title='set to max level' ondblclick='setZeroLv(this)' onclick='setMaxLv(this)' max_lv='"+max_lv[cur]+"'>(max. "+max_lv[cur]+")</div>"+"</div></div>"
    }, "")
})

function setMaxLv(node) {
    let target = node.parentNode.firstElementChild
    target.innerHTML = node.getAttribute("max_lv")
    validate_goal_level_node(target)
}

function setZeroLv(node) {
    let target = node.parentNode.firstElementChild
    target.innerHTML = 0
    validate_goal_level_node(target)
}


Array.from(document.querySelectorAll(".div-col")).forEach(ele => {
    ele.addEventListener("mouseenter", e => {
        let node = e.target
        if(node.classList.contains("div-col")) {
            node.classList.remove("hide")
        }
    })
    ele.addEventListener("mouseleave", e => {
        let node = e.target
        if(node.classList.contains("div-col")) {
            node.classList.add("hide")
        }
    })
})

function readPage() {
    let inputs = Array.from(document.getElementById("input").children)
    let outputvalue = document.getElementById("selectoutput").getAttribute("value")
    let res_pack = {"inputs":[], "output":{}}

    if(inputs.length > 1) {
        let tmplst = []
        inputs.filter(ele => ele.tagName.toUpperCase() === "DIV")
          .map(ele => ele.lastElementChild)
          .filter(ele => ele.getAttribute("value") !== undefined &&
                          ele.getAttribute("value") !== null &&
                          ele.getAttribute("value").trim() !== "")
          .forEach(ele => {
              let tmpdct = {}
              Array.from(ele.children).forEach((list_item, idx, arr) => {
                  if(idx < arr.length-1) {
                      let eid = parser[list_item.lastElementChild.getAttribute("value")]
                      if(eid===undefined || eid ===null)
                          eid = -1
                      tmpdct[eid] = parseInt(list_item.firstElementChild.innerText)
                  }
              })
              if(ele.getAttribute("value")!=="enchanted_book") {
                  tmpdct["item"] = ele.getAttribute("value")
              }
              tmplst.push(tmpdct)
        })
        res_pack["inputs"] = tmplst
    }

    //if output is set, add to res_pack
    if(outputvalue!==null && outputvalue.trim() !=="") {
        let tmp = {}
        Array.from(document.getElementsByClassName("enchantment"))
          .filter(ele => ele.lastElementChild.firstElementChild.innerText !== "0")
          .forEach(ele => {
              tmp[parser[ele.getAttribute("value")]] = parseInt(ele.lastElementChild.firstElementChild.innerText)
          })
        tmp["item"] = outputvalue
        res_pack["output"] = tmp
    }
    return res_pack
}

/*
possible errors:
conflicts items within inputs
conflicts items between inputs and output
invalid enchantment in input item
conflicts enchantment in input item
*/

function validate_input(res_pack) {
    let outdct = res_pack["output"]
    let cur_item = null
    if(Object.keys(outdct).indexOf("item")!==-1) {
        cur_item = outdct["item"]
    }
    let indctlst = res_pack["inputs"]
    if(0 < indctlst.length && indctlst.length < 3) {
        return -700;
    }
    if(Object.keys(outdct).filter(ele=>ele!=="item").length===0 && indctlst.length < 3) {
        return -699;
    }

    let initems = indctlst.filter(indct => Object.keys(indct).indexOf("item")!==-1)
                    .map(indct => indct["item"])
    //non book => book
    if(cur_item==="enchanted_book" && initems.length > 0) {
        return -701;
    }
    //books only => non book
    if(cur_item!==null && cur_item!=="enchanted_book"
        && indctlst.length > 0 && initems.length===0) {
          return -701;
    }
    let err_code = -701
    for(item of initems) {
        if(cur_item===null) {
            cur_item = item
            err_code = -702
        } else if(cur_item!==item) {
            return err_code;
        }
    }

    for(const indct of indctlst) {
        if(Object.keys(indct).indexOf("-1") !==-1)
            return -703;
        for(const eid of Object.keys(indct)) {
            for(const eidflict of (conflicts[eid] || [])) {
                if(Object.keys(indct).indexOf(eidflict)!==-1)
                    return -704;
            }
        }
    }
    return 0
}

function progress_indicate(message) {
    document.getElementById("error-message").innerText = message
}


function computeSingleBookWeight(eid, lv) {
    let impbed = (eid) => (eid===29&&!isJava?0.5:1)
    return cost_book[eid] * lv * impbed(eid)
}


/*
input: {id:lv, item:"item_name"}
output: [weight, sorted by id]
*/
function computeWeight(dct) {
    let impbed = (eid) => (eid===29&&!isJava?0.5:1)
    let multiple_from = ((Object.keys(dct).indexOf("item")!==-1)?cost_item:cost_book)
    let res_lst = []
    sorted(Object.keys(dct).filter(ele=>ele!=="item"), key=(a,b)=>a-b).forEach(eid => {
        res_lst.push(multiple_from[eid] * dct[eid] * impbed(eid))
    })
    return res_lst
}

/*
Possible prune:
output only => fast search
input only => advance search
input + ouput => advance search with goal

Error code:
-699: no inputs
-700: not enought inputs (at least 3)
-701: unmatch input and output item
-702: unmatch input items
-703: invalid enchantmnet
-704: conflicted enchantment
*/
function prune() {
    progress_indicate("parsing")
    let data_pack = readPage()
    let code = validate_input(data_pack)
    if(code===0) {
        progress_indicate("searching")
        console.log(data_pack);
        let indctlst = data_pack["inputs"]
        let outdct = data_pack["output"]
        let res = null

        if(indctlst.length===0) {
            //no input, fast search (item + enchanted books)
            progress_indicate("fast search")

            let outbookdct = {}
            Object.keys(outdct).filter(key => key!=="item").forEach(key => {
                outbookdct[key] = outdct[key]
            })

            let lst = computeWeight(outbookdct)
            lst.splice(0,0,0)
            if(lst.length >= 3 ) {
                res = search(lst)

                let res_wrt = [{"cost":0, "enchant":{"item":outdct["item"]}}]
                res["wrt"].filter(ele => ele > 0).forEach((w, wrtidx) => {
                    let cureid = Object.keys(outbookdct).filter(eid => outbookdct[eid]>0 &&computeSingleBookWeight(eid, outbookdct[eid])===w)[0]
                    let tmpdct = {"cost": w, "enchant": {}}
                    tmpdct["enchant"][cureid] = outbookdct[cureid]
                    res_wrt.push(tmpdct)
                    outbookdct[cureid] = 0
                })

                res["wrt"] = res_wrt

            } else {
                progress_indicate("select at least 2 enchantmnets")
            }
        } else {
            //has input, advance search
            progress_indicate("advance search")
            let lst = []
            let arrdict = {}
            indctlst.forEach((item,idx) => {
                let weight = computeWeight(item).reduce((acc, cur) => acc+cur, 0)
                lst.push(weight)
                arrdict[idx] = item
            })

            //attach "goal" if output present
            if(Object.keys(outdct).filter(key=>key!=="item").length!==0) {
                let tmpdct = {}
                Object.keys(outdct).filter(key=>key!=="item").forEach(key => {
                    tmpdct[key] = outdct[key]
                })
                arrdict["goal"] = tmpdct
            }
            res = search(lst, arrdict)
        }
        console.log(res);
        if(res["anvil_cost"] >= 10000 || res["enchant_cost"] >= 10000) {
            progress_indicate("cannot produce output")
            return
        }
        let tree = new Tree(res["strc"])
        tree.tree_sum(res["wrt"])
        console.log((tree.root));
        displayTree(tree.root)
        let total_cost = res["enchant_cost"] + res["anvil_cost"]
        progress_indicate("Cost: " + total_cost
            + " (" + res["enchant_cost"] + " + " + res["anvil_cost"] + ")")
    } else {
        let error_message = "error message"
        switch (code) {
            case -699: error_message = "no inputs/output";break;
            case -700: error_message = "not enough input (at least 3 items)";break;
            case -701: error_message = "input unmatch output";break;
            case -702: error_message = "input items unmatch";break;
            case -703: error_message = "unknown enchantment in input";break;
            case -704: error_message = "conflicted enchantments in input";break;
        }
        progress_indicate(error_message)
    }
}

romanparser = (i) => (i<=3?"I".repeat(i): (i==4?"I":"") + "V")

function loadNodeValue(value_item, cost, cost2) {
    let res_str = "<div class='tree-item'>"
    if(cost!==undefined && cost2!==undefined) {
        res_str += "Cost: " + (parseInt(cost) + parseInt(cost2))
        res_str += " (" + cost + " + " + cost2 + ")" + "<br>"
    }
    value_item = value_item["enchant"]
    res_str += "<span>" + (value_item["item"] || "enchanted_book").replaceAll("_", " ") + "</span><br>"
    Object.keys(value_item).filter(ele => ele!=="item").forEach(eid => {
        res_str += displayfun(parser[eid]) + " " + romanparser(value_item[eid]) + "<br>"
    })
    res_str += "</div>"
    return res_str
}


anvil_cost_lst = [0,1,3,7,15,31,63,127,255]

function setTreeHeight(node) {
    if(node===null)
        return -1;
    let h = Math.max(setTreeHeight(node.left), setTreeHeight(node.right)) +1
    node.height = h
    return h
}

function loadTree(node, ldep, rdep) {
    if(node.left===null || node.right===-null) {
        return loadNodeValue(node.value)
    }
    let l = loadTree(node.left, ldep, rdep)
    let r = loadTree(node.right, ldep, rdep)
    let anvil_cost = anvil_cost_lst[node.left.height] + anvil_cost_lst[node.right.height]
    let self = loadNodeValue(node.value, node.value["cost"], anvil_cost)
    let output = '<hr><div class="anvil-pair">' + l
                    + '<span class="">+</span>' + r
                    + '<hr>' + self
    document.getElementById("result-tree").innerHTML += output
    return loadNodeValue(node.value)
}

function displayTree(root) {
    document.getElementById("result-tree").innerHTML = ""
    setTreeHeight(root)
    loadTree(root, 0, 0)
}
