dict = JSON.parse(magicstring0)
andt = JSON.parse(magicstring1)
advn = JSON.parse(magicstring2)

/*
compatible
max lv
enchant cost
tools available enchant


dict: {eid: [] }
*/

conflicts = advn["conflicts"]
enchantbytool = advn["enchantbytool"]
isJava = true
protectionTier = [0,1,3,4]
bowInfinityTier = [22,26]
isInProtectionTier = (eid) => {
    return protectionTier.indexOf(parseInt(eid))!==-1
}
isBowInfinityTier = (eid) => {
    return bowInfinityTier.indexOf(parseInt(eid))!==-1
}
anvil_cost_idxer = [0,1,3,7,15,31,63,127,255]

parser = advn["idmap"]
max_lv = advn["max_lv"]
cost_book = advn["enchant_cost"]["book"]
cost_item = advn["enchant_cost"]["item"]
enchantbytool = advn["enchantbytool"]
toolsname = Object.keys(enchantbytool).sort()
displayfun = (str) => str.replaceAll("_", " ")
comparer = (a,b) => parser[a].localeCompare(parser[b])
message_dismiss_handler = null
sorted = (lst, key) => {lst.sort(key); return lst;}
selectable_tools = () => {
    let outvalue = document.getElementById("selectoutput").getAttribute("value")
    if(outvalue!==null && outvalue !==undefined && outvalue.trim()!=="")
        return [outvalue, "enchanted_book"]
    let ar = Array.from(document.querySelectorAll("#input .itemselect"))
              .map(ele => ele.getAttribute("value"))
              .filter(value => value!==null && value!==undefined && value.trim()!==""
                      && value!=="enchanted_book")
    if(ar.length > 0)
          return [ar[0], "enchanted_book"]
    return toolsname
}
number_dropdown_content = (n) => {
    let options = ""
    for(let i = 1;i < n+1; i++) {
        options = "<option value='" + i +"'>" + i + "</option>" + options
    }
    return options
}
number_dropdown_zero_content = (n) => {
    let options = ""
    for(let i = 0;i < n+1; i++) {
        options = options + "<option value='" + i +"'>" + i + "</option>"
    }
    return options
}
enchantment_dropdown = (item) => {
    let main_tool = selectable_tools()[0]
    let isInTool = (eid) => enchantbytool[main_tool].indexOf(eid)!==-1
    let isInConflict = (eid) => Object.keys(conflicts).indexOf(eid)!==-1
    let group_sort = (a,b) => {
        let inConflicta = isInConflict(a)
        let inConflictb = isInConflict(b)
        if((inConflicta && inConflictb) || (!inConflicta && !inConflictb)) {
            return (a-b);
        }
        return (isInConflict(a)?-1:1);
    }
    let sorting_fun = group_sort
    //rank higher for current tools enchantment in enchanted book
    if(main_tool !== item) {
        sorting_fun = (a, b) => {
            let inToola = isInTool(a)
            let inToolb = isInTool(b)
            if(inToola && inToolb) {
                return group_sort(a,b)
            } else if(inToola || inToolb) {
                return (inToola?-1:1);
            }
            return (a-b);
        }
    }
    return [" "].concat(sorted(enchantbytool[item], key=sorting_fun)).reduce((acc, eid) => {
        return acc + "<option value='"+eid+"'>" + displayfun((parser[eid] || " ")) + "</option>"
    }, "")
}
isGodArmorState = () => {
    return (localStorage.getItem("godarmor")||false)==="true"
}


function updateDropDown(node) {
    if(node===undefined || node===null) {
      document.getElementById("selectoutput").innerHTML = [" "].concat(selectable_tools()).reduce((acc, cur) => acc + "<option value=" +cur+">" + cur.replaceAll("_", " ")+"</option>", "")
    }

    Array.from(document.querySelectorAll("#input .itemselect"))
            .filter(ele=>ele!==node && (ele.getAttribute("value")===undefined
                    || ele.getAttribute("value")===null
                    || ele.getAttribute("value").trim()===""))
            .forEach(ele =>
        ele.innerHTML = [" "].concat(selectable_tools()).reduce((acc, cur) => acc + "<option value=" +cur+">" + cur.replaceAll("_", " ")+"</option>", "")
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

function toggleGuide(e) {
    let node = e.target
    if(node.classList.contains("banner")) {
      node.nextElementSibling.classList.toggle('hide');
      localStorage.setItem('hideguide',document.querySelector('.div-guide').classList.contains('hide'))
    }
}


function switchMode(switchTo) {
    switchTo = parseInt(switchTo)
    Array.from(document.getElementsByClassName("mode-button")).forEach((node, idx) => {
        let mode = idx + 1
        if(switchTo === mode) {
            node.classList.remove("off")
        } else {
            node.classList.add("off")
        }
    })
    document.querySelector(".left").style.display = (switchTo===1?"none":"block")
    document.querySelector(".output-item-label").innerText = (switchTo===1?"Final Outcome":"Output Condition")
    document.querySelector(".output-item-label").setAttribute("title", (switchTo===1?"the item you want to make from combining":"restrict the output with specific enchantments (optional)"))
    localStorage.setItem("searchmode", switchTo)
}

function loadGodArmor(value) {
    let cur_option = isGodArmorState()
    if(value!==undefined) {
        cur_option = value
    }
    let god_button = document.querySelector(".god-armor-option-button")
    if(cur_option) {
        god_button.classList.remove("off")
    } else {
        god_button.classList.add("off")
    }
    console.log("God Armor:", cur_option);
    localStorage.setItem("godarmor", cur_option)
}

function toggleGodArmor() {
    let cur_option = isGodArmorState()
    loadGodArmor(!cur_option)
}

function loadPreviousMode() {
    let cur_mode = localStorage.getItem("searchmode") || 1
        console.log("Current Mode:",cur_mode);
    switchMode(cur_mode)
    if((localStorage.getItem("hideguide") || "false")==="true") {
        document.querySelector(".div-guide").classList.add('hide')
    }
}
loadPreviousMode()
loadGodArmor()
attachMoreVerbose()

function attachMoreVerbose(node) {
    if(node===undefined || node === null) {
        node = document.querySelectorAll("[title]")
    } else {
        node = node.querySelectorAll("[title]")
    }
    Array.from(node).forEach(ele => {
        //hover event is never registered in whole project
        ele.addEventListener("mouseover", e => {
            clearTimeout(message_dismiss_handler)
            progress_indicate_quick(e.target.getAttribute("title"))
        })
        ele.addEventListener("mouseleave", e => {
            clearTimeout(message_dismiss_handler)
            message_dismiss_handler = setTimeout(() => {
                progress_indicate_quick("")
            }, 3000)
        })
    })
}


function recycleInputCounter() {
      document.querySelectorAll(".input-item-counter").forEach((node, idx) => {
          node.innerText = "Input Item " + (idx + 1)
      })
}

function recycleEnchantCounter(enchlistnode) {
      enchlistnode.querySelectorAll(".enchantment-list-input-wrapper .select-box-hint")
      .forEach((node, idx) => {
          node.innerText = "Enchant " + (idx + 1)
      })
}

function cloneInputItem(node) {
      let dup = addInputItem()
      let nodeitem = node.querySelector(".itemselect")
      dup.querySelector(".itemselect").selectedIndex =
            Array.apply(null, dup.querySelector(".itemselect").options)
            .map(ele => ele.value)
            .indexOf(nodeitem.options[nodeitem.selectedIndex].value)
      dup.querySelector(".itemselect").dispatchEvent(new Event("change"));

      dup.querySelector(".priorwork select").selectedIndex = node.querySelector(".priorwork select").selectedIndex

      Array.from(node.querySelectorAll(".enchantment-list-item"))
      .filter((ele, idx, arr) => arr.length > 1 && idx < arr.length - 1)
      .forEach(enchlistnode => {
          let lastEnchantNodeDup = dup.querySelector(".enchantment-list-input:last-child")
          let enchantitem = enchlistnode.querySelector(".enchantment-list-input")
          lastEnchantNodeDup.selectedIndex =
                Array.apply(null, lastEnchantNodeDup.options)
                .map(ele => ele.value)
                .indexOf(enchantitem.options[enchantitem.selectedIndex].value)
          lastEnchantNodeDup.dispatchEvent(new Event("change"));

          lastEnchantNodeDup.parentNode.parentNode.querySelector(".enchantment-list-lv").selectedIndex =
              enchlistnode.querySelector(".enchantment-list-lv").selectedIndex
      })

      node.parentNode.insertBefore(dup, node)
      recycleInputCounter()
}

function convertClonable(node) {
      node.classList.add("clickable")
      node.setAttribute("title", "the item to be combined in anvil\n   (click to clone this item)")
      node.addEventListener("click", e => {
          cloneInputItem(e.target.parentNode)
      })
}

function addInputItem() {
      let outer = document.createElement("div")
      outer.classList.add("input-enchant-item")
      outer.innerHTML = "<hr>"

      let itemcnt = document.createElement("div")
      itemcnt.classList.add("select-box-hint")
      itemcnt.classList.add("input-item-counter")
      itemcnt.innerText = "Input Item 1"
      itemcnt.setAttribute("title", "the item to be combined in anvil")

      let inner = document.createElement("div")
      inner.classList.add("row-flex")
      inner.classList.add("row-item-name")

      let dropdownhint = document.createElement("div")
      dropdownhint.classList.add("select-box-hint")
      dropdownhint.innerHTML = "Item Name"

      let dropdown = document.createElement("select")
      dropdown.innerHTML = [" "].concat(selectable_tools()).reduce((acc, cur) => acc + "<option value=" +cur+">" + cur.replaceAll("_", " ")+"</option>", "")
      dropdown.classList.add("itemselect")
      dropdown.classList.add("select-box-content")
      dropdown.setAttribute("title", "select an item")
      dropdown.addEventListener("change", e => {
          let node = e.target
          let value = node.value
          let itemnode = node.parentNode.parentNode
          let enchlist = itemnode.lastElementChild
          convertClonable(itemnode.querySelector(".input-item-counter"))
          enchlist.setAttribute("value", value)
          node.setAttribute("value", value)
          updateDropDown(node)
          if(value.trim()==="") {
              document.getElementById("input").removeChild(itemnode)
              recycleInputCounter()
              return;
          }
          if(itemnode.lastElementChild===node.parentNode) {
              if(document.getElementById("input").lastElementChild === node.parentNode.parentNode)
                  document.getElementById("input").appendChild(addInputItem())
          } else {
              itemnode.removeChild(itemnode.lastElementChild)
              itemnode.removeChild(itemnode.lastElementChild)
          }
          itemnode.appendChild(addPriorWorkPenalty())
          itemnode.appendChild(addEnchantmentList(value))
          recycleInputCounter()
      })

      inner.appendChild(dropdownhint)
      inner.appendChild(dropdown)
      outer.appendChild(itemcnt)
      outer.appendChild(inner)
      attachMoreVerbose(outer)
      return outer
}


//anvil_cost_idxer, from search.js
function addPriorWorkPenalty() {
      let outer = document.createElement("div")
      outer.classList.add("priorwork")
      outer.classList.add("row-flex")

      let dropdownhint = document.createElement("div")
      dropdownhint.classList.add("select-box-hint")
      dropdownhint.innerText = "Prior Work Penalty"
      dropdownhint.title = "ignore the penalty if the item is new to anvil"

      let dropdown = document.createElement("select")
      dropdown.innerHTML = anvil_cost_idxer.reduce((acc, cur) => acc + "<option value=" +cur+">"+cur+"</option>", "")
      dropdown.classList.add("select-box-content")
      dropdown.title = "prior work penalty = cost to rename - 1"

      outer.appendChild(dropdownhint)
      outer.appendChild(dropdown)
      attachMoreVerbose(outer)
      return outer
}


function addEnchantmentListItem(item_value) {
      let inner = document.createElement("div")
      inner.classList.add("enchantment-list-item")

      let wrapper = document.createElement("div")
      wrapper.classList.add("row-flex")

      let enchant_hint = document.createElement("div")
      enchant_hint.classList.add("enchantment-list-lv-hint")
      enchant_hint.classList.add("select-box-hint")
      enchant_hint.innerText = "Lv"

      let enchant_lv = document.createElement("select")
      enchant_lv.contenteditable = 'false'
      enchant_lv.classList.add("enchantment-list-lv")
      enchant_lv.classList.add("select-box-content")
      enchant_lv.setAttribute("title", "click to change enchant level")


      let wrapper_i = document.createElement("div")
      wrapper_i.classList.add("row-flex")
      wrapper_i.classList.add("enchantment-list-input-wrapper")

      let enchant_input_hint = document.createElement("div")
      enchant_input_hint.classList.add("select-box-hint")
      enchant_input_hint.setAttribute("title", "the enchantment on this item")
      enchant_input_hint.innerText = "Enchant"

      let enchant_input = document.createElement("select")
      enchant_input.classList.add("select-box-content")
      enchant_input.classList.add("enchantment-list-input")
      enchant_input.innerHTML = enchantment_dropdown(item_value)
      enchant_input.setAttribute("list", item_value)
      enchant_input.setAttribute("title", "click to select enchantment")
      enchant_input.addEventListener("change", e=> {
          let node = e.target
          let value = node.options[node.selectedIndex].value
          let list_item_parent = node.parentNode.parentNode
          let enchant_list_parent = list_item_parent.parentNode
          if(value.trim() === "") {
              if(enchant_list_parent.lastElementChild!==list_item_parent)
                  enchant_list_parent.removeChild(list_item_parent)
              return;
          }
          node.setAttribute("value", value)
          let lv = list_item_parent.querySelector(".enchantment-list-lv")
          let max_lv_value = max_lv[Number(value).toString()]
          lv.setAttribute("contenteditable", 'false')
          lv.setAttribute("max_lv", max_lv_value)
          lv.innerHTML = number_dropdown_content(max_lv_value)
          lv.value = 1

          if(enchant_list_parent.lastElementChild===list_item_parent) {
              let item_value = node.getAttribute("list")
              enchant_list_parent.appendChild(addEnchantmentListItem(item_value))
          }
      })

      wrapper.appendChild(enchant_hint)
      wrapper.appendChild(enchant_lv)
      wrapper_i.appendChild(enchant_input_hint)
      wrapper_i.appendChild(enchant_input)

      inner.appendChild(wrapper)
      inner.appendChild(wrapper_i)

      attachMoreVerbose(inner)
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




function validate_goal_enchant_node(node) {
    let lv = parseInt(node.getAttribute("level"));
    node.selectedIndex = Array.from(node.options).map(ele => parseInt(ele.value)).indexOf(lv)
    let gp = parseInt(node.getAttribute("group"))
    let eid = node.getAttribute("eid")
    let enchant_line = node.parentNode.parentNode
    enchant_line.setAttribute("lv", lv)
    if(lv > 0) {
        enchant_line.classList.add("highlight")
        //activate mutual exclusive if gp > 0 (has a group)
        //except for protection tier when god armor state is on
        if(gp > 0 && ((!isInProtectionTier(eid) && !isBowInfinityTier(eid)) || !isGodArmorState())) {

          conflicts[eid].forEach(ceid => {
              let parent = document.getElementById("output-enchantments").querySelector("div[value='"+ceid+"']")
              if(parent) {
                  let lvnode = parent.lastElementChild.children[1]
                  lvnode.setAttribute("level", 0)
                  lvnode.parentNode.parentNode.classList.remove("highlight")
                  validate_goal_enchant_node(lvnode)
              }
          })
        }
    } else {
        enchant_line.classList.remove("highlight")
    }
}


function addOutputEnchantment(n_group, eid) {
    let this_max_lv = max_lv[eid]

    let enchant_line = document.createElement("div")
    enchant_line.classList.add("enchantment")
    enchant_line.setAttribute("value", eid)
    enchant_line.setAttribute("lv", 0)

    let enchant_name = document.createElement("span")
    enchant_name.innerText = displayfun(parser[eid])
    enchant_name.setAttribute("title", "level 0 enchantment will be ignored")

    let lv_wrap = document.createElement("div")
    lv_wrap.classList.add("row-flex")


    let lv_hint = document.createElement("div")
    lv_hint.classList.add("select-box-hint")
    lv_hint.innerText = "Lv"

    let lv_select = document.createElement("select")
    lv_select.classList.add("select-box-content")
    lv_select.setAttribute("title", "click to select level")
    lv_select.innerHTML = number_dropdown_zero_content(this_max_lv)
    lv_select.setAttribute("group", n_group)
    lv_select.setAttribute("max_lv", this_max_lv)
    lv_select.setAttribute("level", 0)
    lv_select.setAttribute("eid", eid)
    lv_select.addEventListener("change", e=> {
        let node = e.target
        let value = node.options[node.selectedIndex].value
        node.setAttribute("level", value)
        validate_goal_enchant_node(node)
    })

    let lv_max = document.createElement("div")
    lv_max.classList.add("select-box-hint")
    lv_max.classList.add("cursor-pointer")
    lv_max.setAttribute("title", "click to set max level, double click to reset")
    lv_max.innerText = "max"
    lv_max.addEventListener("click", e=> {
        let node = e.target
        let sibilings = node.parentNode.children
        let lv_node = sibilings[sibilings.length-2]
        lv_node.setAttribute("level", lv_node.getAttribute("max_lv"))
        validate_goal_enchant_node(lv_node)
    })
    lv_max.addEventListener("dblclick", e=> {
        let node = e.target
        let sibilings = node.parentNode.children
        let lv_node = sibilings[sibilings.length-2]
        lv_node.setAttribute("level", 0)
        validate_goal_enchant_node(lv_node)
    })


    lv_wrap.appendChild(lv_hint)
    lv_wrap.appendChild(lv_select)
    lv_wrap.appendChild(lv_max)
    enchant_line.appendChild(enchant_name)
    enchant_line.appendChild(lv_wrap)
    attachMoreVerbose(enchant_line)
    return enchant_line
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

    let parent = document.getElementById("output-enchantments")
    parent.innerHTML = ""
    res_enchant_lst.forEach(eid => {
        if(eid === null) {
            n_group -= 1
            parent.appendChild(document.createElement("hr"))
        } else {
            parent.appendChild(addOutputEnchantment(n_group, eid))
        }
    })

})



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


/*
pack: {"inputs":[{eid:lv, "item":itemname, "prior":#}], "output":{eid:lv, "item":itemname}}

*/
function readPage() {
    let inputs = Array.from(document.getElementById("input").children)
    let outputvalue = document.getElementById("selectoutput").getAttribute("value")
    let res_pack = {"inputs":[], "output":{}}

    if(inputs.length > 1 && document.querySelector(".left").style.display === "block") {
        let tmplst = []
        inputs.filter(ele => ele.tagName.toUpperCase() === "DIV")
          .map(ele => ele.lastElementChild) //enchantment-list class
          .filter(ele => ele.getAttribute("value") !== undefined &&
                          ele.getAttribute("value") !== null &&
                          ele.getAttribute("value").trim() !== "")
          .forEach(ele => {
              let tmpdct = {}
              Array.from(ele.children).forEach((list_item, idx, arr) => {
                  if(idx < arr.length-1) {
                      let input_node = list_item.lastElementChild.lastElementChild
                      let eid = input_node.getAttribute("value")
                      if(eid===undefined || eid ===null)
                          eid = -1
                      let lv_node = list_item.firstElementChild.lastElementChild
                      tmpdct[eid] = parseInt(lv_node.options[lv_node.selectedIndex].value)
                  }
              })
              if(ele.getAttribute("value")!=="enchanted_book") {
                  tmpdct["item"] = ele.getAttribute("value")
              }
              let allchild = ele.parentNode.children
              //row item name,  prior work  , enchantment list
              let priornode = allchild[allchild.length-2].lastElementChild
              let priorwork = parseInt(priornode.options[priornode.selectedIndex].value)
              if(priorwork>0) {
                  tmpdct["prior"] = priorwork
              }
              tmplst.push(tmpdct)
        })
        res_pack["inputs"] = tmplst
    }

    //if output is set, add to res_pack
    if(outputvalue!==null && outputvalue.trim() !=="") {
        let tmp = {}
        Array.from(document.getElementsByClassName("enchantment"))
          .filter(ele => parseInt(ele.getAttribute("lv")) !== 0)
          .forEach(ele => {
              tmp[ele.getAttribute("value")] = parseInt(ele.getAttribute("lv"))
          })
        tmp["item"] = outputvalue
        res_pack["output"] = tmp
    }
    return res_pack
}



/*
pack: {"inputs":[{eid:lv, "item":itemname, "prior":#}], "output":{eid:lv, "item":itemname}}

*/

function reverseLoadPage(packed) {
    console.log("Load from Image")
    console.log(packed);
    let inputs_lst = packed["inputs"]
    let outputdct = packed["output"]
    switchMode((inputs_lst.length===0?1:2))

    let input = document.getElementById("input")
    input.innerHTML = ""
    input.appendChild(addInputItem())

    let selectoutput = document.getElementById("selectoutput")
    selectoutput.selectedIndex = 0
    selectoutput.dispatchEvent(new Event("change"))

    if(Object.keys(outputdct).indexOf("item")!==-1) {
        selectoutput.value = outputdct["item"]
        selectoutput.dispatchEvent(new Event("change"));
        let protectiontiers = Object.keys(outputdct).filter(eid => isInProtectionTier(eid))
        let bowInfinityTier = Object.keys(outputdct).filter(eid => isBowInfinityTier(eid))
        if(protectiontiers.length > 1 || bowInfinityTier.length > 1) {
            loadGodArmor(true)
        }


        let enchantlist = Array.from(document.getElementById("output-enchantments").children).filter(ele => ele.classList.contains("enchantment"))
        Object.keys(outputdct).filter(ele => ele!=="item").forEach(eid => {
            enchantlist.filter(ele => ele.getAttribute("value") === eid).forEach(parentNode => {
                let lvnode = parentNode.querySelector("select")
                lvnode.setAttribute("level", outputdct[eid])
                validate_goal_enchant_node(lvnode)
            })
        })
    }

    if(inputs_lst.length > 0) {
        //reset input area
        let inputdiv = document.getElementById("input")
        inputdiv.innerHTML = ""
        inputdiv.appendChild(addInputItem())

        let lastInputNode = () => inputdiv.lastElementChild
        let currentSelect = () => lastInputNode().querySelector(".itemselect")
        inputs_lst.forEach(inputdct => {
            let currentNode = lastInputNode()
            if(Object.keys(inputdct).indexOf("item")!==-1) {
                currentSelect().value = inputdct["item"]
            } else {
                currentSelect().value = "enchanted_book"
            }
            //lastInputNode() will change after this event, use currentNode
            currentSelect().dispatchEvent(new Event("change"))

            //second last child node (prior work)
            if(Object.keys(inputdct).indexOf("prior")!==-1) {
                let priorwork = currentNode.querySelector(".priorwork select")
                //let priorwork = currentNode.children[currentNode.children.length-2].lastElementChild
                priorwork.selectedIndex = Array.from(priorwork.options).map(ele => parseInt(ele.value)).indexOf(inputdct["prior"])
            }

            let currentLastEnchant = () => currentNode.lastElementChild.lastElementChild
            Object.keys(inputdct).filter(ele => ele!=="item" && ele!=="prior").forEach(eid => {
                let currentenchantitem = currentLastEnchant()
                let enchinput = currentenchantitem.querySelector(".enchantment-list-input")
                enchinput.selectedIndex = Array.from(enchinput.options).map(ele => ele.value).indexOf(eid)
                //currentLastEnchant() will change after this event, use currentenchantitem
                enchinput.dispatchEvent(new Event("change"))

                let currentlv = currentenchantitem.querySelector(".enchantment-list-lv")
                currentlv.selectedIndex = Array.from(currentlv.options).map(ele => parseInt(ele.value)).indexOf(inputdct[eid])
                currentlv.dispatchEvent(new Event("change"))
            })
        })
    }

}


function historyReset() {
    let input = document.getElementById("input")
    input.innerHTML = ""
    input.appendChild(addInputItem())

    let selectoutput = document.getElementById("selectoutput")
    selectoutput.selectedIndex = 0
    selectoutput.dispatchEvent(new Event("change"))
}

function historyReload() {
    let packed_str = localStorage.getItem("enchant_pack") || '{"inputs":[],"output":{}}'
    reverseLoadPage(JSON.parse(packed_str))
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
        return ((Object.keys(outdct).length > 0)?-700:-701);
    }
    if(indctlst.length==0 && Object.keys(outdct).length==0) {
        return -698;
    }
    //output enchantment is not selected
    if(Object.keys(outdct).filter(ele=>ele!=="item").length===0 && indctlst.length < 3) {
        return -699;
    }

    let initems = indctlst.filter(indct => Object.keys(indct).indexOf("item")!==-1)
                    .map(indct => indct["item"])
    //non book => book
    if(cur_item==="enchanted_book" && initems.length > 0) {
        return -702;
    }
    //books only => non book
    if(cur_item!==null && cur_item!=="enchanted_book"
        && indctlst.length > 0 && initems.length===0) {
          return -702;
    }
    let err_code = -702
    for(item of initems) {
        if(cur_item===null) {
            cur_item = item
            err_code = -703
        } else if(cur_item!==item) {
            return err_code;
        }
    }

    for(const indct of indctlst) {
        if(Object.keys(indct).indexOf("-1") !==-1)
            return -704;
        for(const eid of Object.keys(indct)) {
            for(const eidflict of (conflicts[eid] || [])) {
                if(Object.keys(indct).indexOf(eidflict)!==-1)
                    return -705;
            }
        }
    }
    if(indctlst.length > 11 || Object.keys(outdct).length > 11) {
        return -706;
    }
    let priorcnt = indctlst.map(ele => (ele["prior"] | 0)).filter(ele => ele!==0).length
    if(priorcnt>0 && indctlst.length >8)
        return -707;
    return 0
}

function progress_indicate_error(message, success) {
    let message_node = document.getElementById("error-message")
    if(success !== true) {
        message_node.classList.remove("success")
    } else {
        message_node.classList.add("success")
    }
    document.getElementById("error-message").innerText = message
}

function progress_indicate_quick(message) {
    document.getElementById("quick-message").innerText = message
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


function handleSearchResult(res) {
    console.log(res);
    if(res["anvil_cost"] >= 10000 || res["enchant_cost"] >= 10000) {
        progress_indicate_error("items on left don't have enough enchantment levels\n(select a enchantment in 'enchant'\nclick on the number to change level)")
        return
    }
    let tree = res["strc"]
    console.log((tree.root));
    displayTree(tree.root)
    let total_cost = res["enchant_cost"] + res["anvil_cost"]
    progress_indicate_error("Cost: " + total_cost
        + " (" + res["enchant_cost"] + " + " + res["anvil_cost"] + ")", true)
}




/*
Possible prune:
output only => fast search
input only => advance search
input + ouput => advance search with goal

Error code:
-698: no input/output
-699: no output enchantment
-700: not enought inputs (at least 3) to produce right
-701: not enought inputs (at least 3)
-702: unmatch input and output item
-703: unmatch input items
-704: invalid enchantmnet
-705: conflicted enchantment
-706: too many inputs 8
-707: too many inputs 6
*/
var prunable_flag = true

async function prune() {
    if(!prunable_flag)
        return
    progress_indicate_error("parsing")
    let data_pack = storeInputLocal()
    console.log(data_pack);

    let code = validate_input(data_pack)
    if(code===0) {
        progress_indicate_error("searching")
        let indctlst = data_pack["inputs"]
        let outdct = data_pack["output"]
        let res = null

        if(indctlst.length===0) {
            //no input, fast search (item + enchanted books)
            progress_indicate_error("fast search")

            let outbookdct = {}
            Object.keys(outdct).filter(key => key!=="item").forEach(key => {
                outbookdct[key] = outdct[key]
            })

            let lst = computeWeight(outbookdct)
            lst.splice(0,0,0)
            if(lst.length >= 3 ) {
                res = await search(lst, undefined, undefined, outdct, outbookdct)
                handleSearchResult(res)
            } else {
                progress_indicate_error("select at least 2 enchantmnets")
            }
        } else {
            //has input, advance search
            progress_indicate_error("advance search")
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
            //attach "prior" if prior work item exist
            let priorcnt = indctlst.map(ele => (ele["prior"] | 0)).filter(ele => ele!==0)
            arrdict["prior"] = priorcnt.length
            prunable_flag = false

            res = await search(lst, arrdict, isGodArmorState())
            handleSearchResult(res)
            prunable_flag = true
        }
    } else {
        let error_message = "error message"
        switch (code) {
            case -698: error_message = "select something in drop down list";break;
            case -699: error_message = "you need to select a level \n(click on a number to change level\nclick max to set to max level)";break;
            case -700: error_message = "you need to have 3 items on left\n(combine 3 items on left to make right item)";break;
            case -701: error_message = "you need to have 3 items on left\n(click on 'enchant with' to add a enchantment\nclick on a number to change level\nclick max to set to max level)";break;
            case -702: error_message = "cannot combine (wanted item not match)";break;
            case -703: error_message = "cannot combine (your item not match)";break;
            case -704: error_message = "unknown enchantment in your item";break;
            case -705: error_message = "conflicted enchantments in your item";break;
            case -706: error_message = "you have included over 11 items";break;
            case -707: error_message = "you have included over 8 items";break;
        }
        progress_indicate_error(error_message)
    }
}

function search(arr, arrdict, godarmor, outdct, outbookdct) {
    return new Promise((resolve) => {
        worker = new Worker("search.js")
        worker.postMessage({"type": "context", "data": [dict, andt, advn, isJava, protectionTier, bowInfinityTier, anvil_cost_idxer, cost_book]})
        worker.postMessage({"type": "input", "data": [arr, arrdict, godarmor, outdct, outbookdct]})
        worker.addEventListener("message", e => {
            if(e.data) {
                let prog_message = e.data
                if(prog_message["type"]==="result") {
                    resolve(prog_message["data"])
                } else if(prog_message["type"]==="message") {
                    progress_indicate_error(prog_message["data"], true)
                }
            }
        })
    })
}


function loadNodeValue(value_item, cost, cost2) {
    romanparser = (i) => (i<=3?"I".repeat(i): (i==4?"I":"") + "V")
    let res_str = "<div class='tree-item'>"
    if(cost!==undefined && cost2!==undefined) {
        res_str += "Cost: " + (parseInt(cost) + parseInt(cost2))
        res_str += " (" + cost + " + " + cost2 + ")" + "<br>"
    }
    value_item = value_item["enchant"]
    res_str += "<span>" + (value_item["item"] || "enchanted_book").replaceAll("_", " ") + "</span><br>"
    Object.keys(value_item).filter(ele => ele!=="item" && ele !=="prior").forEach(eid => {
        res_str += displayfun(parser[eid]) + " " + romanparser(value_item[eid]) + "<br>"
    })
    res_str += "</div>"
    return res_str
}




function drawCanvas() {
    let canvas = document.getElementById("result-tree-canvas").getContext('2d');
    document.getElementById("result-tree-canvas").height = document.getElementById("result-tree").clientHeight +50
    canvas.clearRect(0, 0, canvas.width, canvas.height);
    canvas.font = "18px Monospace"
    let anvil_pairs = Array.from(document.querySelectorAll(".anvil-pair"))
    let total_line = 0
    let pair_max_line = 0
    const line_height = 20

    let total_cost = document.getElementById("error-message").innerText
    canvas.fillText(total_cost, 2 * 300 + 20, 20);
    total_line += 2
    anvil_pairs.forEach((pair, ridx) => {
        canvas.beginPath()
        canvas.moveTo(0, total_line * line_height)
        canvas.lineTo(900, total_line * line_height)
        canvas.closePath()
        canvas.stroke()

        let treeitems = Array.from(pair.children).filter(ele => ele.classList.contains("tree-item"))

        treeitems.forEach((itemnode, cidx) => {
            let node_text = itemnode.innerHTML
            let node_texts = node_text.split("<br>")
            let this_node_max_line = 0
            node_texts.forEach((node_inner_text, line) => {
                if(node_inner_text.indexOf("span")!==-1) {
                    node_inner_text = node_inner_text.replaceAll("<span>","").replaceAll("</span>","")
                    node_inner_text = " > " + node_inner_text + " < "
                }
                this_node_max_line += 1
                canvas.fillText(node_inner_text, cidx * 300 + 20, total_line * line_height + line*line_height + 25);
            })
            pair_max_line = Math.max(pair_max_line, this_node_max_line)
        })

        total_line += pair_max_line
        total_line += 1

    });

    canvas.beginPath()
    canvas.moveTo(600, 0 )
    canvas.lineTo(600, total_line * line_height)
    canvas.closePath()
    canvas.stroke()

    total_line += 1
    canvas.font = "13px Monospace"
    canvas.fillText("To reload, drop this image into " + "https://kkchengaf.github.io/Minecraft-Enchantment-Order-Calculator/", 0, total_line * line_height)

    return document.getElementById("result-tree-canvas")
}

// canvas: canvas node
// data: json string
//return a thenable (blob object)
function packDataToImage(canvas, data) {
    //canvas.getImageData(0,0, canvas.width, canvas.height)
    let url = canvas.toDataURL();
    let data_bytes = new TextEncoder().encode(data)

    return fetch(url).then(res => {
        return res.arrayBuffer().then(bytes => {
            var test = bytes
            let n_len = bytes.byteLength
            let buffer = new ArrayBuffer(n_len + data_bytes.length)
            let res_bytes = new Uint8Array(buffer, 0, buffer.byteLength)
            res_bytes.set(new Uint8Array(bytes), 0)
            res_bytes.set(data_bytes, n_len)
            return res_bytes;
        })
    })
}


function loadTree(node) {
    if(node.left===null || node.right===-null) {
        return loadNodeValue(node.value)
    }
    let l = loadTree(node.left)
    let r = loadTree(node.right)
    let anvil_cost = node.value["prior"]
    let self = loadNodeValue(node.value, node.value["cost"], anvil_cost)
    let output = '<hr><div class="anvil-pair">' + l
                    + '<span class="">+</span>' + r
                    + '<hr>' + self
    document.getElementById("result-tree").innerHTML += output
    return loadNodeValue(node.value)
}

function storeInputLocal() {
    let packed = readPage()
    localStorage.setItem("enchant_pack", JSON.stringify(packed))
    return packed
}

function addSaveButton() {
    let button = document.createElement("div")
    button.classList.add("button")
    button.classList.add("select-box-hint")
    button.classList.add("cursor-pointer")
    button.setAttribute("title", "save result as image and drag here to import")
    button.innerHTML = "Save Result"
    //when clicked, draw and save the result as png
    button.addEventListener("click", e => {
        let packed = localStorage.getItem("enchant_pack") || null
        if(packed!==null) {
            //get the canvase node after drawing
            let canvas = drawCanvas()
            let thenable = packDataToImage(canvas, packed)

            //174 66 96 130
            //AE 42 60 82
            //download packed
            thenable.then(bytes => {
                let blob = new Blob([bytes], {type:"image/png"})
                let url = URL.createObjectURL(blob)
                let atag = document.createElement("a")
                atag.href = url
                atag.style.display = "none"
                document.body.appendChild(atag)
                atag.setAttribute("download", "enchantments_order.png")
                atag.click()
                atag.remove()
            })
        }
    })
    return button
}


function displayTree(root) {
    document.getElementById("result-tree").innerHTML = ""
    document.getElementById("result-tree-button").innerHTML = ""
    loadTree(root)
    document.getElementById("result-tree-button").appendChild(addSaveButton())
}

//search from end to first
//return the index of first byte after EOF
function searchEOF(ab){
    let n = ab.byteLength-1
    // n-3 n-2 n-1 n-0
    //searching for 174 66 96 130
    int8view = new Uint8Array(ab)
    while(3<=n) {
        if(int8view[n-3]==174 && int8view[n-2]==66 && int8view[n-1]==96 && int8view[n]==130)
            return n+1
        n -= 1
    }
    return -1
}



function validateDroppedPng(file, callback) {
    let reader = new FileReader()
    reader.onload = () => {
        let url = reader.result
        fetch(url).then(res => {
            return res.arrayBuffer()
        }).then(bytes => {
            let start_data_idx = searchEOF(bytes)
            if(start_data_idx!==-1) {
                let data_bytes = bytes.slice(start_data_idx)
                if(data_bytes.byteLength > 0) {;
                    let data = new TextDecoder().decode(data_bytes)
                    let json = JSON.parse(data)
                    if(validate_input(json)===0) {
                        callback(json)
                        prune()
                    } else {
                        console.log("Invalid data")
                    }
                } else {
                    console.log("No data inside image")
                }
            }
        })
    }
    reader.readAsDataURL(file)
}



var body = document.body
body.addEventListener("dragover", e=> {

    e.preventDefault();
    e.dataTransfer.dropEffect = "move"
})
body.addEventListener("drop", e=> {
    e.preventDefault();
    let files = e.dataTransfer.files
    if(files.length!==1) {
        return ;
    }
    validateDroppedPng(files[0], reverseLoadPage)
})

historyReload()
