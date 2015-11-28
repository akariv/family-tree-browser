import json

def nameof(name):
    parts = [x.strip() for x in name.split('/')]
    if "," in parts[0]:
        parts[0] = parts[0].split(",")
        parts[0 ] = parts[0][0]+" (%s)" % "/".join(parts[0][1:])
    parts = [ parts[2], parts[0], parts[1] ]
    parts = [p for p in parts if p != '']
    return " ".join(parts)

if __name__=="__main__":
    records = json.load(open('sample-data/result.json'))['data']
    print("{} records".format(len(records)))

    people = []
    families = {}

    # Find all individuals
    ids = {}
    for rec in records:
        graph = rec['graph']
        family = None
        fid = pid = None
        for node in graph['nodes']:
            if "FAM" in node['labels']:
                assert(fid is None)
                fid = int(node['id'])
                family = families.setdefault(fid,{'children':[], 'partners':[]})
            if "INDI" in node['labels']:
                assert(pid is None)
                pid = int(node['id'])
                props = node['properties']
                if pid not in ids:
                    idx = len(people)
                    person = {'children':set(), 'parents':set(), 'partners':set(), 'siblings':set(), 'active_partner':None, 'props':{'sex':props['SEX'],'name':nameof(props['NAME']),'id':idx}}
                    people.append(person)
                    ids[pid] = idx
                else:
                    person=people[ids[pid]]
        for rel in graph['relationships']:
            typ = rel['type']
            assert(pid == int(rel['startNode']))
            assert(fid == int(rel['endNode']))
            if typ=='CHILD_IN':
                family['children'].append(pid)
            elif typ=='WIFE_IN' or typ=='HUSBAND_IN':
                family['partners'].append(pid)
            else:
                assert(False)

    for family in families.values():
        for c in family['children']:
            kid = people[ids[c]]
            for s in family['children']:
                if s != c:
                    kid['siblings'].add(ids[s])
            for p in family['partners']:
                parent = people[ids[p]]
                kid['parents'].add(ids[p])
                parent['children'].add(ids[c])
        for p in family['partners']:
            parent = people[ids[p]]
            for r in family['partners']:
                if r != p:
                    parent['partners'].add(ids[r])

    def cp(d):
        ret = {}
        ret.update(d)
        return ret

    for p in people:
        p['props']['children'] = [ cp(people[x]['props']) for x in p['children'] ]
        p['props']['parents'] = [ cp(people[x]['props']) for x in p['parents'] ]
        # p['props']['children'] = list(p['children'])
        # p['props']['parents'] = list(p['parents'])

    out = []
    for p in people:
        rec = {}
        rec.update(p['props'])
        rec['children'] = [ people[x]['props'] for x in p['children'] ]
        rec['partners'] = [ people[x]['props'] for x in p['partners'] ]
        rec['parents'] = [ people[x]['props'] for x in p['parents'] ]
        rec['siblings'] = [ people[x]['props'] for x in p['siblings'] ]
        out.append(rec)

    print("{} output records".format(len(out)))
    out = json.dumps(out, indent=2)
    out = "nodes = {};".format(out)
    open('nodes.js','w').write(out)
    #
    #
    # # Process releationships
    # for rec in records:
    #     graph = rec['graph']
    #     for rel in graph['relationships']:
    #         try:
    #             typ = rel['type']
    #             nodes = [ int(rel['startNode']), int(rel['endNode']) ]
    #             for node in nodes:
    #                 if node in families:
    #                     family =
    #             print(typ, people[ids[src]]['name'], people[ids[dst]]['name'])
    #         except Exception as e:
    #             print(str(e),rel)
